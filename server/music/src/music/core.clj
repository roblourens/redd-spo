(ns music.core
  (:gen-class)
  (:require [http.async.client :as http])
  (:require [clojure.data.json :as json])
  (:require [aws.sdk.s3 :as s3])
  (:import [java.net URLEncoder]))

(set! *warn-on-reflection* true)

(def cred {:access-key "AKIAJKKRMAO6YBDXWITQ", :secret-key "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"})

(defn get-json [url]
	(println "getting " url)
	(with-open [client (http/create-client)]
		(let [resp (http/GET client url)]
			(-> resp http/await http/string (#(json/read-str % :key-fn keyword))))))

(defn map-vals [f m]
  (into {} (for [[k v] m] [k (f v)])))

(defn search-spotify [q]
	(defn first-href [d]
		(-> d :tracks first :href))			
	(defn clean-query [q]
		""
		(-> q
			(#(clojure.string/replace % #"-" " - "))
			(#(clojure.string/replace % #"feat.|feat|ft.|ft|&amp;|:" ""))))
	(defn do-search [q]
		(println "searching for " q)
		(-> (str "http://ws.spotify.com/search/1/track.json?q=" (URLEncoder/encode (clean-query q) "UTF-8"))
			get-json
			first-href))
	(if-let [results do-search]
		results))

(defn get-submissions [name]
	"Returns the submission title/urls for a subreddit, filtering self posts"
	
	(defn filter-self-posts [submissions]
		(filter #(not (-> % :data :is_self)) submissions))

	(defn extract-all-bits [submissions]
		(defn extract-bits [submission]
			{:title (-> submission :data :title) 
			 :url (-> submission :data :url)})
		(map extract-bits submissions))

	(-> (format "http://www.reddit.com/r/%s.json" name) 
		get-json
		:data :children
		filter-self-posts
		extract-all-bits))

(defn resolve-submission [submission]
	(def title (submission :title))
	(assoc submission :sp-uri (search-spotify title)))

(defn resolve-subreddit [name]
	"Retrieves the subreddit submissions and resolves them to subreddit data ({:name altrock :tracks [...]})"
	(println "resolve-subreddit " name)
	{:name name
	 :tracks (map resolve-submission (get-submissions name))})

(defn resolve-categories [category-map]
	(defn resolve-cat [cat]
		"Resolve a category ([altrock ...]) to a list of subreddit data"
		(map resolve-subreddit cat))
	(map-vals resolve-cat category-map))

(defn get-categories-list [path]
	(json/read-str (slurp path) :key-fn keyword))

(defn write-results [results]
	"results are {:rm [list of subreddit data ...] ...}"
	(let [results-json (json/write-str results)]
		(s3/put-object cred "rl-reddspo" "results.json" results-json)
		(s3/update-object-acl cred "rl-reddspo" "results.json" (s3/grant :all-users :read))
		(spit "results.json" results-json))
	)


(defn -main [& args]
	"Do the things."
	(println (write-results (resolve-categories (get-categories-list "subreddits.json")))))

; TODO
; Find a way to unescape &amp; etc or look for more to add manually