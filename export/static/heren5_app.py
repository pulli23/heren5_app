import os
from functools import lru_cache

import flask
from flask import Flask, render_template

from server import allowed_path

app = Flask(__name__, static_folder="static", template_folder="server/templates")


allowed_paths = allowed_path.AllowedPaths()



#@app.route('/jspm_packages/<path>')
#def loadjs(path):
#    return flask.send_from_directory("", path)


@app.route('/')
def login():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # u = os.path.join(SITE_ROOT, "/data.txt")
    u = flask.url_for("static", filename="index.html")
    return flask.send_file("index.html")
    if m == 'POST':
        dat = LoadData(u)
        if "input" in d and d["input"].lower() == dat["login"].lower():
            r = flask.Response(dat["site"])
            r.status_code = 200
            return r
        r = flask.Response("/sad")
        r.status_code = 401
        return r
    else:
        u = os.path.join(SITE_ROOT, "index.html")
        r = flask.make_response()
        return flask.send_file(u)
        # return render_template('index.html')

@app.route('/sad')
def sad():
    return render_template('sad.html')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def loadjs(path):
    if allowed_paths.is_allowed(path):
        r = app.root_path
        s = app.static_folder
        fname2 = os.path.join(s, path)
        f = flask.send_file(fname2)
        return f
    return path #flask.send_from_directory("", path)

@lru_cache(4)
def LoadData(fname):
    out = {}
    with open(fname) as f:
        lines = f.readlines()
        # noinspection PyTypeChecker
        t = [line.split('=', 2) for line in lines]
        out = {k.strip(): "=".join(v).strip() for k, *v in t}
        print(out)
    return out




if __name__ == '__main__':
    app.run()
