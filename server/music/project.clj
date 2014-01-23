(defproject music "0.1.5-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [http.async.client "0.5.2"]
                 [org.clojure/data.json "0.2.3"]
                 [clj-aws-s3 "0.3.7"]
                 [org.clojure/clojure-contrib "1.2.0"]]
  :main ^:skip-aot music.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
