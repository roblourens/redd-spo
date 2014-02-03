(ns music.core
	(:gen-class)
	(:require
		[music.util :as util]
		[music.spotify :as spotify]
		[music.aws :as aws]
		[music.reddit :as reddit]

        [clojure.data.json :as json]
		[clojure.tools.logging :as log])
  (:use [clojure.contrib.core :only (-?>)]))

(set! *warn-on-reflection* true)

(defn- extract-sp-uris [subreddit]
	"Turn a lot of data into just the necessary Spotify URIs"
	(assoc subreddit :tracks
		; Extract sp-uri values from the track map and filter out nils
		(filter #(not (nil? %))
			(map #(% :sp-uri) (subreddit :tracks)))))

(defn- write-subreddit [subreddit]
	"results are {:rm [list of subreddit data ...] ...}"
	(let [objectname (str (subreddit :name) ".json")
		  dbgobjectname (str "dbg-" objectname)]
		(aws/write-object dbgobjectname (json/write-str subreddit))
		(aws/write-object objectname (json/write-str (extract-sp-uris subreddit)))))

(defn- resolve-submission [submission]
	"Resolves a Reddit submission object by adding a key :sp-uri"
	(log/trace "hello?")
	(let [newSubmission (assoc submission :sp-uri (util/dbg (spotify/resolve-submission-title-to-id (submission :title))))]
		(log/trace newSubmission)
		newSubmission))

(defn- resolve-subreddit [sr-name]
	"Resolves the subreddit name to subreddit data {:name altrock :tracks [...]}"
	(log/info "resolve-subreddit " sr-name)
	{:name sr-name
	 :tracks (pmap resolve-submission (reddit/get-submissions sr-name))})

(defn- resolve-write-subreddit [sr-name]
	(write-subreddit (resolve-subreddit sr-name)))

(defn -main [& args]
	"Read a flat list of subreddits. Resolve all of them."
	(pmap resolve-write-subreddit
		(util/json-from-file "subreddits-flat.json")))