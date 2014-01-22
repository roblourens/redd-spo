(ns music.spotify
    (:require [music.util :as util])
    (:import [java.net URLEncoder]))

(defn- filter-non-us [d]
    "Filters non-US-allowed songs from the set of Spotify results"
    (filter #(re-matches #".*US.*" (-> % :album :availability :territories)) d))

(defn- filter-karaoke-tribute [d]
    "Filters karaoke, tribute")

(defn- clean-query [q]
        "Add spaces around '-' and remove some unneeded things"
        (-> q
            clojure.string/trim
            (clojure.string/replace #"-" " - ")
            (clojure.string/replace #" feat\.?| ft\.?| &amp;|:" "")))

(defn- do-search [q]
    (util/log (str "searching for " q))
    (-> (str "http://ws.spotify.com/search/1/track.json?q=" (URLEncoder/encode (clean-query q) "UTF-8"))
        util/get-json
        :tracks
        filter-non-us
        first))

(defn- remove-between-regexes-transform [r1 r2 & [e]]
        "Removes all instances of text between r1 and r2 which doesn't inlude e (or 'remix'/'mashup'). Good enough for most cases.
         Returns nil when no change"
        (defn process-match [q match]
            "Processes one substring of q as a candidate for removal.
            Removes it if it does not contain 'remix' or 'mashup'."
            (if (or
                    (re-find #"(?i)remix" match)
                    (re-find #"(?i)mashup" match))
                q
                (clojure.string/replace q match "")))
        #(reduce process-match % (re-seq (re-pattern (format "%s[^%s]*%s" r1 (if (nil? e) r2 e) r2)) %)))

(defn- try-transform-rec [q transforms]
    "todo Make this not recursive, maybe."
    (defn continue [q']
        "Makes the next recursive call"
        (try-transform-rec q' (rest transforms)))

    (if (> (count transforms) 0)
        ; Apply the transform - if it changed anything, search with it
        (let [q' ((first transforms) q)]
            (if (not= q q')
                (if-let [results (do-search q')]
                    results
                    (continue q'))
                (continue q')))

        ; No transforms left - return nil
        nil))

(defn resolve-submission-title [q]
    "Resolves a submission title query to a Spotify result object"
    (if-let [results (do-search q)]
        results
        (try-transform-rec
            q
            [(remove-between-regexes-transform "\\[" "\\]")
             (remove-between-regexes-transform "\\(" "\\)")
             (remove-between-regexes-transform "\\[" "$" "\\]")
             (remove-between-regexes-transform "\\(" "$" "\\)")
             ; Remove numbers 1900-2019. Likely years
             #(clojure.string/replace % #"19[0-9][0-9]|20[0-1][0-9]" "")])))

(defn resolve-submission-title-to-id [q]
    "Resolves a submission title query to a Spotify item id"
    (map 
        #(% :href)
        (resolve-submission-title q)))