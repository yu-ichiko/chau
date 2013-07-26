var fs = require('fs');

var async = require('async');
var difflet = require('difflet');
var deepEqual = require('deep-equal');
var request = require('request');
var argv = require('optimist').argv;

var before = argv.b;
var after = argv.a;
var filters = argv._ || [];

if (!before || !after) {
    console.log('usage: chau -b a.json -a b.json');
    console.log('   or: chau -b http://example.com/a.json -a http://example.com/b.json foo');
    console.log('   or: chau -b a.json -a b.json foo');
    process.exit(1);
}

var parse = function(data) {
    try {
        var lines = (data || '')
            .split(/\n/)
            .filter(function(line) {
                return line;
            });

        if (lines.length === 1) {
            return JSON.parse(lines);
        }

        return lines.reduce(function(map, line) {
            var obj = JSON.parse(line);
            map[obj._id] = obj;
            return map;
        }, {});

    } catch(e) {
        return JSON.parse(data);
    }
};

var filter = function(data) {
    var json = JSON.stringify(data, function(key, value) {
        if (filters.indexOf(key) > -1) {
            return undefined;
        }
        return value;
    });
    return JSON.parse(json);
};

var read = function(path, callback) {
    if (/^http/.test(path)) {
        request(path, function(err, res, body) {
            if (err) {
                throw err;
            }

            callback(null, filter(parse(body)));
        });
        return;
    }

    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            throw err;
        }

        callback(null, filter(parse(data)));
    });
};


var diff = difflet({
    indent:2,
    comment: true
});

async.parallel({
    prev: function(next) {
        read(before, next);
    },
    next: function(next) {
        read(after, next);
    }
}, function(err, data) {
    var prev = data.prev;
    var next = data.next;

    Object.keys(prev).forEach(function(key) {
        if (deepEqual(prev[key], next[key])) {
            delete prev[key];
            delete next[key];
        }
    });

    console.log(diff.compare(prev, next));
});

