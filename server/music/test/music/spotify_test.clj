(ns music.spotify-test
    (:require [clojure.test :refer :all]
              [music.spotify :refer :all]
              [music.util :as util]))

(defn- test-query-fail [q]
    (let [spotify-result (resolve-submission-title q)]
        (is (nil? spotify-result))))

(defn- test-query [q expected-artist expected-title]
    (let [spotify-result (resolve-submission-title q)]
        (if (is (not (nil? spotify-result)))
            (are [x y] (= (util/safe-lower-case x) (util/safe-lower-case y))
                expected-title (spotify-result :name)
                expected-artist (-> spotify-result :artists first :name)))))

(defn- fail [m q]
    (testing m
        (test-query-fail q)))


; Basic cases

(defn- testify [m q]
    (testing m
        (test-query q "Rage Against the Machine" "Testify")))

(deftest ta-test
    (testify
        "Title - Artist"
        "Testify - Rage Against the Machine"))

(deftest at-test
    (testify
        "Artist - Title"
        "Rage Against the Machine - Testify"))

(deftest square-brackets-end-test
    (testify
        "Square brackets end"
        "Rage Against the Machine - Testify [great song lol]"))

(deftest square-brackets-middle-test
    (testify
        "Square brackets middle"
        "Rage Against the Machine [great band lol] - Testify"))

(deftest unmatched-square-brackets-test
    (testify
        "Unmatched square brackets"
        "Rage Against the Machine - Testify [great band lol"))

(deftest parens-end-test
    (testify
        "Parens end"
        "Rage Against the Machine - Testify (NOW TESTIFY)"))

(deftest parens-middle-test
    (testify
        "Parens middle"
        "Rage Against the Machine - (IT'S RIGHT OUTSIDE OUR DOOR, NOW) Testify"))

(deftest unmatched-parens-test
    (testify
        "Unmatched parens"
        "Rage Against The Machine - Testify (NOW TESTIFY"))

(deftest year-test
    (testify
        "Year"
        "Rage Against the Machine - Testify 1995"))

(deftest dashes-test
    (testify
        "Dashes"
        "Rage-Against-the-Machine-Testify"))


; Multi-artist

(defn- clarity [m q]
    (testing m
        (test-query q "Zedd" "Clarity")))

(deftest feat-test
    (clarity
        "feat."
        "Clarity - Zedd feat. Foxes"))

(deftest ft-test
    (clarity
        "ft."
        "Clarity - Zedd ft. Foxes"))

(deftest amp-test
    (clarity
        "&amp;"
        "Clarity - Zedd &amp; Foxes"))

(deftest colon-test
    (clarity
        ":"
        "Clarity - Zedd: Foxes"))


; Remixes/mashups

(defn- go-with-it [m q]
    (testing m
        (test-query q "Tokimonsta" "Go With It - Yung Skeeter Remix")))

(defn- mashup [m q]
    (testing m
        (test-query q "Mike Tompkins" "Feel Again / Dog Days (Mashup)")))

(deftest remix-brackets-test
    (go-with-it
        "Remix in brackets"
        "Tokimonsta - Go With It [Yung Skeeter Remix]"))

(deftest remix-parens-test
    (go-with-it
        "Remix in parens"
        "Tokimonsta - Go With It (Yung Skeeter Remix)"))

(deftest mashup-brackets-test
    (mashup
        "Mashup in brackets"
        "Mike Tompkins - Feel Again/Dog Days [Mashup]"))

(deftest mashup-parens-test
    (mashup
        "Mashup in parens"
        "Mike Tompkins Mashup - Feel Again/Dog Days"))


; Karaoke

(defn- war-pigs [m q]
    (testing m
        (test-query q "Black Sabbath" "War Pigs - Basement Tape")))

(deftest made-famous-by-test
    (war-pigs
        "Avoid 'Made famous by'"
        "Black Sabbath - War Pigs [Heavy Metal]"))

(deftest tribute-to-test
    (fail
        "Avoid 'Tribute to'"
        "Tracey Ullman - They Don't Know"))

(defn- come-on-eileen-tribute [m q]
    (testing m
        (test-query q "Pickin' On Series" "Come On Eileen - The Bluegrass Tribute to Dexy's Midnight Runners")))

(deftest tribute-to-in-query-test
    (come-on-eileen-tribute
        "When the query contains 'tribute to', don't discard 'tribute to' results"
        "Come On Eileen - Bluegrass Tribute to Dexy's Midnight Runners"))


; Other unnecessary text

(deftest unnecessary1-test
    (testify
        "Unnecessary"
        "We didn't get much love on /r/music. Let's try here. Testify - Rage Against the Machine (Danish band)"))

(deftest unnecessary-comma-test
    (testify
        "Unnecessary comma"
        "Testify - Rage Against the Machine, the song rocks"))