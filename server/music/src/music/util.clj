(ns music.util
    (:require
        [http.async.client :as http]
        [clojure.data.json :as json]))

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

(defn json-from-file [path]
    (json/read-str (slurp path) :key-fn keyword))