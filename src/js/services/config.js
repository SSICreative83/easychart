(function () {
    function constructor(mediator, data) {
        var _ = {
            isUndefined: require('lodash.isundefined'),
            find: require('lodash.find'),
            cloneDeep: require('lodash.clonedeep'),
            forEach: require('lodash.foreach'),
            merge: require('lodash.merge'),
            isEmpty: require('lodash.isempty'),
            map: require('lodash.map')
        };
        var series = require('../factories/series.js');
        var that = {};
        var presets = {
            chart:{

            },
            xAxis:[{

            }],
            yAxis:[{

            }]
        };


        var config = _.cloneDeep(presets);
        var configCache;
        that.get = function () {
            var labels = hasLabels(data.get());
            var object = _.merge(_.cloneDeep(config), _.cloneDeep(presets));
            object.series = series.get(data.getData(labels.series, labels.categories), object, labels, data.getCategories(), data.getSeries());
            configCache = _.cloneDeep(object);
            return configCache;
        };

        that.getRaw = function () {
            return _.cloneDeep(config);
        };

        that.set = function (_config_) {
            _config_.series = _.map(_config_.series, function(serie){
                delete serie.data;
                delete serie.x;
                delete serie.y;
                delete serie.z;
                delete serie.value;
                delete serie.low;
                delete serie.q1;
                delete serie.median;
                delete serie.q3;
                delete serie.high;
                return serie;
            });
            config = _.cloneDeep(_config_);
            if(!config.xAxis){
                config.xAxis = [{}];
            }
            if(!config.yAxis){
                config.yAxis = [{}];
            }
        };

        that.setValue = function (path, value) {
            var ids = path.split('.');
            var step;
            var object = config;
            while (step = ids.shift()) {
                if (ids.length > 0) {
                    if (!_.isUndefined(object[step])) {
                        object = object[step];
                    } else {
                        object[step] = {};
                        object = object[step];
                    }
                } else {
                    object[step] = value;
                }
            }
            configUpdate();
        };

        that.setValues = function (array) {
            _.forEach(array, function (row) {
                that.setValue(row[0], row[1]);
            });
            configUpdate();
        };

        that.getValue = function (path) {
            var object = that.get();
            path = path.split('.');
            var step;
            while (step = path.shift()) {
                if (!_.isUndefined(object[step])) {
                    object = object[step];
                } else {
                    object = undefined;
                    break;
                }
            }
            return object;
        };

        that.isEditable = function (path) {
            var object = _.cloneDeep(presets);
            path = path.split('.');
            var step;
            while (step = path.shift()) {
                if (!_.isUndefined(object[step])) {
                    object = object[step];
                } else {
                    object = undefined;
                    break;
                }
            }
            return _.isUndefined(object);
        };

        that.removeValue = function (path) {
            var temp = config;
            path = path.split('.');
            while (step = path.shift()) {
                if (!_.isUndefined(temp[step])) {
                    if (path.length > 0) {
                        temp = temp[step];
                    } else {
                        if(Object.prototype.toString.call( temp ) === '[object Array]'){
                            temp.splice(step, 1);
                        } else {
                            delete temp[step];
                        }
                    }
                }
            }
            configUpdate();
        };

        that.loadTemplate = function (template) {
            config = _.merge(_.cloneDeep(presets), template);
            if(!config.xAxis){
                config.xAxis = [{}];
            }
            if(!config.yAxis){
                config.yAxis = [{}];
            }
            configUpdate();
        };

        that.setPresets = function (_presets_) {
            presets = _presets_;
            configUpdate();
        };

        that.getPresets = function () {
            return _.cloneDeep(presets);
        };

        function hasLabels(data) {
            var labels = {
                categories: false,
                series: true
            };
            if (data[0]) {
                // if the first cell is empty, make the assumption that the first column are labels.
                if (_.isEmpty(data[0][0]) || data[0][0] == 'cat' || data[0][0] == 'categories') {
                    labels.categories = true;
                } else {
                    labels.categories = false;
                }
            }
            return labels;
        }

        function configUpdate(){
            mediator.trigger('configUpdate', that.get());
            mediator.trigger('configUpdateRaw', that.getRaw());
        }

        mediator.on('dataUpdate', function(data){
            configUpdate();
        });

        return that;

    }

    module.exports = constructor;
})();