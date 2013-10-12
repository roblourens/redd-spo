(ns music.core
  (:gen-class)
  (:require [http.async.client :as http])
  (:require [clojure.data.json :as json]))

(import [java.net URLEncoder])

(defn print-body []
	(defn first-url [d]
		(-> d :data :children first :data :url))
	(with-open [client (http/create-client)]
		(let [resp (http/GET client "http://www.reddit.com/r/music.json?limit=5")]
			(-> resp http/await http/string (#(json/read-str % :key-fn keyword)) first-url println))))

(defn print-yt-search []
	(defn first-title [d]
		(-> d :items first :snippet :title))
	(with-open [client (http/create-client)]
		(let [resp (http/GET client "https://www.googleapis.com/youtube/v3/videos?part=snippet&id=PCkT4K-hppE&key=AIzaSyBQ_mbpccgEaHnifMNpPI_dyqd7Hi83fmM")]
			(-> resp http/await http/string (#(json/read-str % :key-fn keyword)) first-title println))))

; s: search query
(defn print-first-result [s]
	(defn first-href [d]
		(-> d :tracks first :href))
	(with-open [client (http/create-client)]
		(let [resp (http/GET client (str "http://ws.spotify.com/search/1/track.json?q=" (URLEncoder/encode s "UTF-8")))]
			(-> resp http/await http/string (#(json/read-str % :key-fn keyword)) first-href println))))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (println "Hello, World!")
  (print-body)
  (print-yt-search)
  (print-first-result "eskmo - cloudlight")
  (println "done"))
