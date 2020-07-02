const path = require('path')

const config = {
    mode: (process.env.ENV === 'DEVEL') ? "development" : "production",
    entry: path.resolve(__dirname, "web_js/app_public.js"),
    output: {
        path: path.resolve(__dirname, "public/js")
    },
    devtool: "source-map"
}

module.exports = config
