import json
import os
from functools import lru_cache

import flask
import math
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy

from server import allowed_path
allowed_paths = allowed_path.AllowedPaths()



app = Flask(__name__, static_folder="static", template_folder="server/templates")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///./server/players.db'
db = SQLAlchemy(app)

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    type = db.Column(db.Boolean, nullable=False)
    powerups = db.Column(db.String(), nullable=True)
    updated = db.Column(db.Date, nullable=False)
    started = db.Column(db.Boolean, nullable=False)
    start_latitude = db.Column(db.Float, nullable=False)
    start_longitude = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username

    def to_json_dict(self):
        d = {
            "name": self.username,
            "lat": self.latitude,
            "lon": self.longitude,
            "type": self.type,
            "started": self.started,
            "start_lat": self.start_latitude,
            "start_lon": self.start_longitude
            }
        return d

#db.create_all()
#g = Group(username="testname", longitude=0, latitude=0, type=False)
#db.session.add(g)
#db.session.commit()
# @app.route('/jspm_packages/<path>')
# def loadjs(path):
#    return flask.send_from_directory("", path)



def GetGroupEntry(name):
    return Group.query.filter_by(username=name).first()

def MakeFox(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        olddata.type = True
        db.session.commit()
        return "Made {0} a fox".format(olddata.username)
    return "{0} not found".format(name)

def MakeHunter(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        olddata.type = False
        db.session.commit()
        return "Made {0} a hunter".format(name)
    return "{0} not found".format(name)

def ForceStart(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        olddata.started = True
        db.session.commit()
        return "Forced {0} to start playing".format(olddata.username)
    return "{0} not found".format(name)

def ForceStop(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        olddata.started = False
        db.session.commit()
        return "Forced {0} to stop playing".format(olddata.username)
    return "{0} not found".format(name)


def create_or_update_group(name, type, started, start_lat, start_lon,
                           current_latitude=None, current_longitude=None, **kwargs):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        olddata.started = started
        olddata.type = type
        olddata.start_latitude = start_lat
        olddata.start_longitude = start_lon
        if current_latitude is not None:
            olddata.latitude = current_latitude
        if current_longitude is not None:
            olddata.longitude = current_longitude
        for a, v in kwargs:
            setattr(olddata, a, v)
        return False
    else:
        if current_longitude is None:
            current_longitude = 0
        if current_latitude is None:
            current_latitude = 0
        g = Group(username=name, latitude=current_latitude, longitude=current_longitude, type=type,
                  started=started, start_latitude=start_lat, start_longitude=start_lon, **kwargs)
        db.session.add(g)
        return True



def AddGroup(name, start_lat, start_lon):
    try:
        start_lat = float(start_lat)
        start_lon = float(start_lon)
    except ValueError as e:
        print(e)
        return str(e)
    else:
        started = False
        action_done = create_or_update_group(name, False, started, start_lat, start_lon)
        db.session.commit()
        if action_done:
            return "added {0}".format(name)
        else:
            return "reset {0}".format(name)


def DeleteGroup(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        db.session.delete(olddata)
        db.session.commit()
        return "deleted {0}".format(olddata.username)
    return "{0} not found".format(name)

def SetFoxes(names):
    ret = ""
    all_data = Group.query.all()
    for name in all_data:
        MakeHunter(name)
    for name in names:
        ret += MakeFox(name) + '\n'
    return ret

def SetPosition(groupID, latitude, longitude):
    olddata = groupID
    olddata.latitude = latitude
    olddata.longitude = longitude
    db.session.commit()

def GetAllHunters():
    dat = Group.query.filter_by(type=False)
    return dat

def GetAllFoxes():
    dat = Group.query.filter_by(type=True)
    return dat

def GetType(name):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        return olddata.type
    raise KeyError("{0} not found".format(name))


def ForceSetPosition(name, lat, lon):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        try:
            latval = float(lat)
            lonval = float(lon)
        except ValueError as e:
            return str(e)
        else:
            olddata.latitude = latval
            olddata.longitude = lonval
            db.session.commit()
        return "Updated {0} position".format(olddata.username)
    return "{0} not found".format(name)


def SetStartPosition(name, lat, lon):
    olddata = Group.query.filter_by(username=name).first()
    if olddata is not None:
        try:
            latval = float(lat)
            lonval = float(lon)
        except ValueError as e:
            return str(e)
        else:
            olddata.start_latitude = latval
            olddata.start_longitude = lonval
            db.session.commit()
        return "Updated {0} position".format(olddata.username)
    return "{0} not found".format(name)


def DistHaversine(lat1, lon1, lat2, lon2):
    R = 6371000
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    lon1 = math.radians(lon1)
    lon2 = math.radians(lon2)
    dLat = (lat2 - lat1)
    dLon = (lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(lat1) * math.cos(lat2) * math.sin(dLon / 2) * math.sin(dLon / 2)

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    d = R * c

    return d


def Bearing(lat1, lon1, lat2, lon2):
    R = 6371000
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)
    lon1 = math.radians(lon1)
    lon2 = math.radians(lon2)
    y = math.sin(lon2 - lon1) * math.cos(lat2);
    x = math.cos(lat1)*math.sin(lat2) - \
        math.sin(lat1)*math.cos(lat2)*math.cos(lon2-lon1);
    print([lat1, lon1, lat2, lon2])

    bearing = math.atan2(y, x)
    print(bearing)
    return bearing




def GetMinDistToOthers(group, others):
    dis = math.inf
    for other_group in others:
        if other_group is group:
            continue
        d = DistHaversine(group.latitude, group.longitude, other_group.latitude, other_group.longitude)
        if d < dis:
            dis = d
    return dis


def OrderAllGroupsBySparsity():
    groups = Group.query.all()
    v = [(group.username, GetMinDistToOthers(group, groups)) for group in groups]
    v.sort(key=lambda i: i[1])
    return v


def AllData():
    groups = Group.query.all()
    return [g.to_json_dict() for g in groups]


def MakeFoxFromJson(d):
    try:
        name = d["name"]
        lat = d.get("lat", None)
        if lat is not None:
            lat = float(lat)
        lon = d.get("lon", None)
        if lon is not None:
            lon = float(lon)
        type = d["type"]
        started = d["started"]
        start_lat = float(d["start_lat"])
        start_lon = float(d["start_lon"])
    except KeyError as e:
        return "bad json: ({0})".format(str(e))
    except ValueError as e:
        return "bad json: ({0})".format(str(e))
    else:
        ret = create_or_update_group(name, type, started, start_lat, start_lon, lat, lon)
        db.session.commit()
        if ret:
            return "Added new data"
        else:
            return "overwritten data"


@app.route('/')
def login():
    s = app.static_folder
    fname2 = os.path.join(s, "index.html")
    f = flask.send_file(fname2)
    return f


@app.route('/sad')
def sad():
    return render_template('sad.html')


@app.route('/ivossenjacht/admin', methods=["POST"])
def DoAdminTasks():
    if request.method == 'POST':
        form = request.form
        try:
            cmd = form["cmd"]
            if cmd.lower() == "create":
                name = form["name"]
                lat = form["lat"]
                lon = form["lon"]
                return AddGroup(name, lat, lon)
            elif cmd.lower() == "delete":
                name = form["name"]
                return DeleteGroup(name)
            elif cmd.lower() == "make-fox":
                name = form["name"]
                return MakeFox(name)
            elif cmd.lower() == "make-hunter":
                name = form["name"]
                return MakeHunter(name)
            elif cmd.lower() == "force-start":
                name = form["name"]
                return ForceStart(name)
            elif cmd.lower() == "force-stop":
                name = form["name"]
                return ForceStop(name)
            elif cmd.lower() == "set-foxes":
                names = form["names"]
                dat = json.loads(names)
                return SetFoxes(dat)
            elif cmd.lower() == "get-distances":
                sparse = OrderAllGroupsBySparsity()
                return jsonify(sparse)
            elif cmd.lower() == "set-position":
                name = form["name"]
                lat = form["lat"]
                lon = form["lon"]
                return ForceSetPosition(name, lat, lon)
            elif cmd.lower() == "set-start-position":
                name = form["name"]
                lat = form["lat"]
                lon = form["lon"]
                return SetStartPosition(name, lat, lon)
            elif cmd.lower() == "make-group-from-json":
                json_str = form["json"]
                d = json.loads(json_str)
                return MakeFoxFromJson(d)
            elif cmd.lower() == "make-multiple-from-json":
                json_str = form["json"]
                l = json.loads(json_str)
                ret = ""
                for elem in l:
                    ret += MakeFoxFromJson(elem) + "\n"
                return ret
            elif cmd.lower() == "get-all-data":
                groups = AllData()
                return jsonify(groups)
            return "Command unknown"
        except KeyError:
            print(form)
        r = Flask.response_class()
        r.status_code = 501
        r.data = "Bad POST command"
        return r


def updateData(group, form):
    try:
        lat = float(form["lat"])
        lon = float(form["lon"])
        SetPosition(group, lat, lon)
    except ValueError as e:
        print(e)
        pass
    except KeyError as e:
        print(e)
        pass
    else:
        start_dis = DistHaversine(group.latitude, group.longitude, group.start_latitude, group.start_longitude)
        if start_dis < 30:
            group.started = True
            db.session.commit()


@app.route('/ivossenjacht/<userid>', methods=["POST", "GET"])
def loadPlayerDataNew(userid):
    group = GetGroupEntry(userid)
    typestr = ""
    extra_info = ""
    if not group:
        typestr = "!!!Naam niet bekent!!!"
        return jsonify(type=typestr, targets=[])
    if request.method == 'POST':
        updateData(group, request.form)
    foxes = []
    try:
        idx = GetType(userid)
        if idx:
            foxes = GetAllHunters()
            typestr = "Vos"
            extra_info += "Pijl is dichtsbijzijnde jager"
        else:
            foxes = GetAllFoxes()
            typestr = "Jager"
            extra_info += "Pijl is dichtsbijzijnde vos"
    except KeyError:
        idx = None
        extra_info = "!!!Data corrupt, vraag om reset!!!"
    if group.started:
        targetPositions = [{"name": fox.username, "pos": [fox.latitude, fox.longitude]} for fox in foxes]
    else:
        if idx is not None:
            extra_info = ""
        extra_info += " !!!Ga naar start positie!!! (afstand: {0} meter)".format(
            DistHaversine(group.latitude, group.longitude, group.start_latitude, group.start_longitude))
        targetPositions = [{"name": "start", "pos": [group.start_latitude, group.start_longitude]}]
    ret = jsonify(type=typestr, extra=extra_info, targets=targetPositions)
    return ret


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def loadjs(path):
    r = app.root_path
    s = app.static_folder
    if allowed_paths.is_allowed(path):
        fname2 = os.path.join(s, path)
        f = flask.send_file(fname2)
        return f
    fname2 = os.path.join(s, path)
    f = flask.send_file(path)
    return f  # flask.send_from_directory("", path)


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
