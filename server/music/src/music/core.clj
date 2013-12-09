(ns music.core
	(:gen-class)
	(:require
		[clojure.data.json :as json]
		[aws.sdk.s3 :as s3]
		[music.util :as util]
		[music.resolve_sp :as resolve_sp])
  (:use [clojure.contrib.core :only (-?>)]))

(set! *warn-on-reflection* true)

(def cred {:access-key "AKIAJKKRMAO6YBDXWITQ", :secret-key "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"})

(defn submit-object [objectname json-object]
	; Add the json stringify the object and send to s3 with correct content-type
	(s3/put-object
		cred
		"rl-reddspo"
		objectname
		(json/write-str json-object)
		{:content-type "application/json"})

	; Set permissions on the object
	(s3/update-object-acl
		cred
		"rl-reddspo"
		objectname
		(s3/grant :all-users :read)))

(defn clean-results [subreddits]
	"Turn a lot of data into just the necessary Spotify URIs"
	(defn extract-sp-uris [subreddit]
		(assoc subreddit :tracks
			; Extract sp-uri values from the track map and filter out nils
			(filter #(not (nil? %)) 
				(map #(% :sp-uri) (subreddit :tracks)))))
	(map extract-sp-uris subreddits))

(defn write-results [results]
	"results are {:rm [list of subreddit data ...] ...}"
	(doseq [[cat subreddits] results]
		(let [objectname (str (name cat) ".json")
			  dbgobjectname (str "dbg-" objectname)]
			(submit-object dbgobjectname subreddits)
			(submit-object objectname (clean-results subreddits)))))

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
				  resultData (-> url util/get-json :data)]
				(assemble-submissions-rec (concat submissions (resultData :children)) (resultData :after) (- i 1)))))

	(-> (assemble-submissions-rec {} nil 5)
		filter-self-posts
		extract-all-bits))

(defn resolve-submission [submission]
	"Resolves a Reddit submission object to a Spotify id"
	(assoc submission :sp-uri (resolve_sp/resolve-submission-title (submission :title))))

(defn resolve-subreddit [name]
	"Resolves the subreddit name to subreddit data ({:name altrock :tracks [...]})"
	(println "resolve-subreddit " name)
	{:name (str "/r/" name)
	 :tracks (map resolve-submission (get-submissions name))})

(defn resolve-subreddit-list [l]
	"Resolve a subreddit list ([altrock ...]) to a list of subreddit data"
	(map resolve-subreddit l))

(defn resolve-categories [category-map]
	(util/map-vals resolve-subreddit-list category-map))

(defn -main [& args]
	"Do the things."
	; todo - write each category as it is completed and release memory
	(write-results (resolve-categories (util/json-from-file "subreddits.json"))))