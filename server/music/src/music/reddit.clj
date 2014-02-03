(ns music.reddit
    (:require
        [music.util :as util]
        [clojure.tools.logging :as log]))

(defn- filter-self-posts [submissions]
    "Filters the self posts from a set of Reddit submission data objects"
    (filter #(not (-> % :data :is_self)) submissions))

(defn- make-submission [submission-data]
    "Build a submission object from Reddit's submission data"
    {:title (-> submission-data :data :title) 
     :url (-> submission-data :data :url)})

(defn- make-submissions [submission-datas]
    "(map) for submission"
    (map make-submission submission-datas))

(defn- assemble-submission-data-rec [submission-data subreddit-name after i]
    "concat i pages of submission data into the submission-data list"
    (if (= i 0)
        submission-data
        (let [url (format "http://www.reddit.com/r/%s.json%s" subreddit-name (if after (format "?after=%s" after) ""))
              result-data ((util/get-json url) :data)]
            (assemble-submission-data-rec 
                (concat submission-data (:children result-data))
                subreddit-name
                (:after result-data)
                (- i 1)))))

(defn- log-submissions [submissions subreddit-name]
    (log/info
        (format "Got %d submissions for %s" (count submissions) subreddit-name))
    submissions)

(defn get-submissions [subreddit-name]
    "Returns the submission title/urls for a subreddit, filtering self posts"
    (-> (assemble-submission-data-rec () subreddit-name nil 5)
        filter-self-posts
        make-submissions
        (log-submissions subreddit-name)))