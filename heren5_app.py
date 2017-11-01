from functools import lru_cache
import flask
from flask import Flask, request, render_template
import os

app = Flask(__name__)

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



@app.route('/', methods=['GET', 'POST'])
def login():
    m = request.method
    d = request.values
    if m == 'POST':
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        u = os.path.join(SITE_ROOT, "static/data.txt")
        dat = LoadData(u)
        if "input" in d and d["input"].lower() == dat["login"].lower():
            r = flask.Response(dat["site"])
            r.status_code = 200
            return r
        r = flask.Response("/sad")
        r.status_code = 401
        return r
    else:
        return render_template('index.html')

#
# @app.route('/sad')
# def sad():
#     return render_template('sad.html')


if __name__ == '__main__':
    app.run()