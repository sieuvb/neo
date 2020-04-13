import {default as Component} from '../Base.mjs';

/**
 * Convenience class to render an OpenStreetMap
 * Requires setting Neo.config.useOpenStreetMaps to true (or manually include the lib)
 * @class Neo.component.wrapper.OpenStreetMap
 * @extends Neo.component.Base
 */
class OpenStreetMap extends Component {
    static getConfig() {return {
        /**
         * @member {String} className='Neo.component.wrapper.OpenStreetMap'
         * @private
         */
        className: 'Neo.component.wrapper.OpenStreetMap',
        /**
         * @member {String} ntype='openstreetmap'
         * @private
         */
        ntype: 'openstreetmap',
        /**
         *
         * @member {String|null} accessToken=null
         */
        accessToken: null,
        /**
         * @member {Object} center_={lat: 0, lng: 0}
         */
        center_: {lat: 0, lng: 0},
        /**
         * @member {Boolean} convertDataToGeoJson=true
         * @private
         */
        convertDataToGeoJson: true,
        /**
         * @member {Array|null} data_=null
         * @private
         */
        data_: null,
        /**
         * Assuming there is just 1 source for data changes.
         * Create a ticket in case it needs to get enhanced.
         * @member {String|null} dataSourceId=null
         */
        dataSourceId: null,
        /**
         * https://docs.mapbox.com/mapbox-gl-js/style-spec/
         * @member {Object|String} mapboxStyle=null
         */
        mapboxStyle_: null,
        /**
         * @member {Object} _vdom
         */
        _vdom: {
            style: {position: 'relative', height: '100%', width: '100%'},
            cn: [{
                style: {position: 'absolute', height: '100%', width: '100%'},
                cn: [{
                    style: {
                        height: '100%'
                    }
                }]
            }]
        },
        /**
         *
         * @member {Number} zoom_=3
         */
        zoom_: 3
    }}

    /**
     *
     */
    getVdomRoot() {
        return this.vdom.cn[0].cn[0];
    }

    /**
     *
     */
    getVnodeRoot() {
        return this.vnode.childNodes[0].childNodes[0];
    }

    /**
     *
     */
    onConstructed() {
        super.onConstructed();

        const me = this;

        me.on('mounted', () => {
            Neo.main.lib.OpenStreetMaps.create({
                accessToken: me.accessToken,
                center     : me.center,
                id         : me.id,
                mapboxStyle: me.mapboxStyle,
                zoom       : me.zoom
            }).then(me.onMapMounted);
        });
    }

    /**
     * Triggered after the center config got changed
     * @param {Object} value
     * @param {Object} oldValue
     * @private
     */
    afterSetCenter(value, oldValue) {
        this.centerMap(value);
    }

    /**
     * Triggered after the data config got changed
     * @param {Array|null} value
     * @param {Array|null} oldValue
     * @private
     */
    afterSetData(value, oldValue) {
        if (value) {
            Neo.main.lib.OpenStreetMaps.updateData({
                data        : value,
                dataSourceId: this.dataSourceId,
                id          : this.id
            });
        }
    }

    /**
     * Triggered after the mapboxStyle config got changed
     * @param {Object|String} value
     * @param {Object|String} oldValue
     * @private
     */
    afterSetMapboxStyle(value, oldValue) {
        if (this.mounted) {
            Neo.main.lib.OpenStreetMaps.setStyle({
                accessToken: this.accessToken,
                id         : this.id,
                style      : value
            });
        }
    }

    /**
     * Triggered after the zoom config got changed
     * @param {Number} value
     * @param {Number} oldValue
     * @private
     */
    afterSetZoom(value, oldValue) {
        if (this.mounted) {
            Neo.main.lib.OpenStreetMaps.zoom({
                id  : this.id,
                zoom: value
            });
        }
    }

    /**
     *
     */
    autoResize() {
        Neo.main.lib.OpenStreetMaps.autoResize({
            id: this.id
        });
    }

    /**
     * Triggered before the center config gets changed.
     * @param {Object} value
     * @param {Object} oldValue
     * @private
     */
    beforeSetCenter(value, oldValue) {
        if (value && value.long) {
            value.lng = value.long;
            delete value.long;
        }

        return value;
    }

    /**
     * Triggered before the data config gets changed.
     * @param {Array|null} value
     * @param {Array|null} oldValue
     * @private
     */
    beforeSetData(value, oldValue) {
        if (value && this.convertDataToGeoJson) {
            value = this.convertToGeoJson(value);
        }

        return value;
    }

    /**
     * Use component.center = {} or component.flyTo() instead
     * @param {Object} value
     * @param {Number} value.lat
     * @param {Number} value.lng
     * @param {Boolean} animate=false
     * @private
     */
    centerMap(value, animate=false) {
        Neo.main.lib.OpenStreetMaps.center({
            animate: animate,
            id     : this.id,
            lat    : value.lat,
            lng    : value.lng
        });
    }

    /**
     *
     * @param {Array} data
     * @return {Object} Object matching the geojson format
     */
    convertToGeoJson(data) {
        const geoJson = {
            type    : 'FeatureCollection',
            features: []
        };

        data.forEach(item => {
            // todo: this needs to get more generic
            geoJson.features.push({
                type: 'Feature',

                properties: {
                    active   : item.active,
                    cases    : item.cases,
                    deaths   : item.deaths,
                    id       : item.countryInfo.iso2,
                    recovered: item.recovered,
                    time     : item.updated
                },

                geometry: {
                    type       : 'Point',
                    coordinates: [item.countryInfo.long, item.countryInfo.lat]
                }
            })
        });

        return geoJson;
    }

    /**
     *
     * @param {Object} value
     * @param {Number} value.lat
     * @param {Number} value.lng
     */
    flyTo(value) {
        const me = this;

        value = me.beforeSetCenter(value, null); // long => lng if needed

        me._center = {lat: value.lat, lng: value.lng}; // silent update

        me.centerMap(value, true);
    }

    /**
     * Override this method to trigger logic after the map got mounted into the dom
     */
    onMapMounted() {
        console.log('onMapMounted');
    }
}

Neo.applyClassConfig(OpenStreetMap);

export {OpenStreetMap as default};