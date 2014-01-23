(ns music.core
	(:gen-class)
	(:require
		[music.util :as util]
		[music.spotify :as spotify]
		[music.aws :as aws]
		[music.reddit :as reddit])
  (:use [clojure.contrib.core :only (-?>)]))

(set! *warn-on-reflection* true)

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
			(aws/submit-object dbgobjectname subreddits)
			(aws/submit-object objectname (clean-results subreddits)))))

(defn resolve-submission [submission]
	"Resolves a Reddit submission object to a Spotify id"
	(assoc submission :sp-uri (spotify/resolve-submission-title-to-id (submission :title))))

(defn resolve-subreddit [name]
	"Resolves the subreddit name to subreddit data ({:name altrock :tracks [...]})"
	(println "resolve-subreddit " name)
	{:name (str "/r/" name)
	 :tracks (map resolve-submission (reddit/get-submissions name))})

(defn resolve-subreddit-list [l]
	"Resolve a subreddit list ([altrock ...]) to a list of subreddit data"
	(map resolve-subreddit l))

(defn resolve-categories [category-map]
	(util/map-vals resolve-subreddit-list category-map))

(defn -main [& args]
	"Do the things."
	(-> "subreddits.json"
		util/json-from-file
		resolve-categories
		write-results))