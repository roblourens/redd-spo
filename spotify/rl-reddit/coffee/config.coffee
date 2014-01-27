window.Config = {}
window.Mode =
    Dev: "dev"
    Release: "rel"

Config.CurrentMode = Mode.Dev
Config.UrlBase =
    if Config.CurrentMode == Mode.Dev
    then "http://rl-reddspo-dev.s3-website-us-east-1.amazonaws.com/"
    else "http://rl-reddspo.s3-website-us-east-1.amazonaws.com/"

# Always re-render a category page when it appears
Config.AlwaysRerender = true