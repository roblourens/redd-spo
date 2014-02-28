(ns music.aws
    (:require
        [music.config :as config]
        [music.creds :as creds]

        [aws.sdk.s3 :as s3]
        [clojure.tools.logging :as log]))

(defn write-json-str [objectpath json-str]
    (log/info (format "Writing %s to AWS" objectpath))
    ; json stringify the object and send to s3 with correct content-type
    (s3/put-object
        creds/cred
        config/aws-bucket-name
        objectpath
        json-str
        {:content-type "application/json"})

    ; Set permissions on the object
    (try (s3/update-object-acl
        creds/cred
        config/aws-bucket-name
        objectpath
        (s3/grant :all-users :read))
        (catch Exception e (str "caught exception: " (.getMessage e) " objectpath: " objectpath))))