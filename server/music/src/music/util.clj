(ns music.util
    (:require
        [http.async.client :as http]
        [clojure.data.json :as json]
        [music.config :as config]))

; From http://www.learningclojure.com/2010/09/defn-vs-defmacro-what-is-macro-why-is.html
(defmacro dbg[x] `(let [x# ~x] (log "dbg:" '~x "=" x#) x#))

(defn log [m]
    (if config/debug-logging (println m)))

(defn get-json [url]
    (log (str "getting " url))
    (with-open [client (http/create-client)]
        (let [resp (http/GET client url)]
            (try
                (-> resp http/await http/string (json/read-str :key-fn keyword))
            (catch Exception e {})))))

(defn map-vals [f m]
    (into {} (for [[k v] m] [k (f v)])))

(defn json-from-file [path]
    (json/read-str (slurp path) :key-fn keyword))

(defn safe-lower-case [s]
    (if (nil? s)
        s
        (clojure.string/lower-case s)))