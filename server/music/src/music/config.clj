(ns music.config)

(def ^:const debug-logging true)

(def mode "dev")

(def aws-bucket-name
    (if (= mode "release")
        "rl-reddspo"
        "rl-reddspo-dev"))