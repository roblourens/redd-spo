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
	(let [subreddit-name (subreddit :name)
		  objectpath (format "data/%s.json" subreddit-name)
		  dbgobjectpath (format "debug/%s.json" subreddit-name)]
		(aws/write-json-str dbgobjectpath (json/write-str subreddit))
		(aws/write-json-str objectpath (json/write-str (extract-sp-uris subreddit)))))

(defn- resolve-submission [submission]
	"Resolves a Reddit submission object by adding a key :sp-uri"
	(log/trace "resolve-submission" (submission :title))
	(let [newSubmission (assoc submission :sp-uri (spotify/resolve-submission-title-to-id (submission :title)))]
		(log/trace "end resolve-submission" (submission :title))
		newSubmission))

(defn- resolve-subreddit [sr-name]
	"Resolves the subreddit name to subreddit data {:name altrock :tracks [...]}"
	{:name sr-name
	 :tracks (doall (pmap resolve-submission (reddit/get-submissions sr-name)))})

(defn- resolve-write-subreddit [sr-name]
	(log/trace "resolve-write-subreddit" sr-name)
	(write-subreddit (resolve-subreddit sr-name))
	(log/trace "end resolve-subreddit" sr-name))

(defn -main [& args]
	; Send the categories file to AWS
	(let [categories-filename "categories.json"
		  file-contents (slurp categories-filename)]
		(aws/write-json-str categories-filename file-contents))

	; Read a flat list of subreddits. Resolve all of them. 
	; Investigate parallelizing this. Using pmap here results in lots of nulls from spotify/ for some reason.
	(doall (map resolve-write-subreddit
		(util/json-from-file "subreddits-flat.json")))

	(shutdown-agents))