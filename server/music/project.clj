(defproject music "0.1.5-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [http.async.client "0.5.2"]
                 [org.clojure/data.json "0.2.3"]
                 [clj-aws-s3 "0.3.7"]
                 [org.clojure/clojure-contrib "1.2.0"]

                 ;; LOGGING DEPS
                 [org.clojure/tools.logging "0.2.4"]
                 [org.slf4j/slf4j-log4j12 "1.7.1"]
                 [log4j/log4j "1.2.17" :exclusions [javax.mail/mail
                                                    javax.jms/jms
                                                    com.sun.jmdk/jmxtools
                                                    com.sun.jmx/jmxri]]]
  :main ^:skip-aot music.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
