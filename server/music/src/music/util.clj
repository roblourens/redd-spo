(ns music.util
    (:require
        [http.async.client :as http]
        [clojure.tools.logging :as log]
        [clojure.data.json :as json]
        [music.config :as config]))

; From http://www.learningclojure.com/2010/09/defn-vs-defmacro-what-is-macro-why-is.html
(defmacro dbg[x] `(let [x# ~x] (log/debug (str "dbg:" '~x "=" x#)) x#))

(defn get-json [url]
    (log/debug (str "GET " url))
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

(defmacro not-nil? [x] `(not (nil? ~x)))

(defmacro arrowfilter [coll pred] `(filter ~pred ~coll))