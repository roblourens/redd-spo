(ns music.core
  (:gen-class)
  (:require [http.async.client :as http])
  (:require [clojure.data.json :as json])
  (:require [aws.sdk.s3 :as s3])
  (:import [java.net URLEncoder])
  (:use [clojure.contrib.core :only (-?>)]))

(set! *warn-on-reflection* true)


(def cred {:access-key "AKIAJKKRMAO6YBDXWITQ", :secret-key "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"})

; From http://www.learningclojure.com/2010/09/defn-vs-defmacro-what-is-macro-why-is.html
(defmacro dbg[x] `(let [x# ~x] (println "dbg:" '~x "=" x#) x#))

(defn get-json [url]
	(println "getting " url)
	(with-open [client (http/create-client)]
		(let [resp (http/GET client url)]
			(try
				(-> resp http/await http/string (json/read-str :key-fn keyword))
			(catch Exception e {})))))

(defn map-vals [f m]
  (into {} (for [[k v] m] [k (f v)])))

(defn search-spotify [q]
	(defn filter-non-us [d]
		(filter #(re-matches #".*US.*" (-> % :album :availability :territories)) d))

	(defn clean-query [q]
		"Add spaces around '-' and remove some unneeded things"
		(-> q
			(clojure.string/replace #"-" " - ")
			(clojure.string/replace #" feat.| feat| ft.| ft|&amp;|:" "")))

	(defn do-search [q]
		(println "searching for " q)
		(-> (str "http://ws.spotify.com/search/1/track.json?q=" (URLEncoder/encode (clean-query q) "UTF-8"))
			get-json
			:tracks
			filter-non-us
			first
			:href))

	(if-let [results (do-search q)]
		results
		(if-let [wo-brackets-q (clojure.core/re-matches #".*\[(.*)\]" q)]
			(if (not (clojure.core/re-matches #"(?i) remix" (nth wo-brackets-q 1)))
				(do-search (clojure.string/replace q #"\[.*\]" ""))
				nil)
			nil)))

(defn get-submissions [name]
	"Returns the submission title/urls for a subreddit, filtering self posts"
	
	(defn filter-self-posts [submissions]
		(filter #(not (-> % :data :is_self)) submissions))

	(defn extract-all-bits [submissions]
		(defn extract-bits [submission]
			{:title (-> submission :data :title) 
			 :url (-> submission :data :url)})
		(map extract-bits submissions))

	(defn assemble-submissions-rec [submissions after i]
		(if (= i 0)
			submissions
			(let [url (format "http://www.reddit.com/r/%s.json%s" name (if after (format "?after=%s" after) ""))
				  resultData (-> url get-json :data)]
				(assemble-submissions-rec (concat submissions (resultData :children)) (resultData :after) (- i 1)))))

	(-> (assemble-submissions-rec {} nil 5)
		filter-self-posts
		extract-all-bits))

(defn resolve-submission [submission]
	(def title (submission :title))
	(assoc submission :sp-uri (search-spotify title)))

(defn resolve-subreddit [name]
	"Retrieves the subreddit submissions and resolves them to subreddit data ({:name altrock :tracks [...]})"
	(println "resolve-subreddit " name)
	{:name (str "/r/" name)
	 :tracks (map resolve-submission (get-submissions name))})

(defn resolve-categories [category-map]
	(defn resolve-cat [cat]
		"Resolve a category ([altrock ...]) to a list of subreddit data"
		(map resolve-subreddit cat))
	(map-vals resolve-cat category-map))

(defn get-categories [path]
	(json/read-str (slurp path) :key-fn keyword))

(defn write-results [results]
	"results are {:rm [list of subreddit data ...] ...}"
	(let [results-json (json/write-str results)]
		(s3/put-object cred "rl-reddspo" "results.json" results-json)
		(s3/update-object-acl cred "rl-reddspo" "results.json" (s3/grant :all-users :read))
		(spit "results.json" results-json)))

(defn -main [& args]
	"Do the things."
	(println (write-results (resolve-categories (get-categories "subreddits.json")))))

; TODO
; Remove () also
; Add extra pages of results