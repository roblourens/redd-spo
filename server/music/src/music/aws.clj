(ns music.aws
    (:require
        [music.config :as config]
        [music.creds :as creds]

        [aws.sdk.s3 :as s3]
        [clojure.tools.logging :as log]))

(defn write-object [objectname json-object]
    (log/info (format "Writing %s to AWS" objectname))
    ; json stringify the object and send to s3 with correct content-type
    (s3/put-object
        creds/cred
        config/aws-bucket-name
        objectname
        json-object
        {:content-type "application/json"})

    ; Set permissions on the object
    (s3/update-object-acl
        creds/cred
        config/aws-bucket-name
        objectname
        (s3/grant :all-users :read)))