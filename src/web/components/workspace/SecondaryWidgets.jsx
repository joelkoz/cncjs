import _ from 'lodash';
import pubsub from 'pubsub-js';
import React from 'react';
import Sortable from 'react-sortablejs';
import store from '../../store';
import Widget from './Widget';

const sortableOptions = {
    model: 'widgets',
    group: {
        name: 'secondary',
        pull: true,
        put: ['primary']
    },
    handle: '.widget-header',
    dataIdAttr: 'data-widgetid'
};

class SecondaryWidgets extends React.Component {
    static propTypes = {
        onDelete: React.PropTypes.func.isRequired
    };
    state = {
        widgets: store.get('workspace.container.secondary.widgets')
    };
    pubsubTokens = [];

    componentDidMount() {
        this.subscribe();
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    componentDidUpdate() {
        const { widgets } = this.state;

        // Calling store.set() will merge two different arrays into one.
        // Remove the property first to avoid duplication.
        store.replace('workspace.container.secondary.widgets', widgets);

        // Publish a 'resize' event
        pubsub.publish('resize'); // Also see "widgets/visualizer.jsx"
    }
    subscribe() {
        { // updateSecondaryWidgets
            let token = pubsub.subscribe('updateSecondaryWidgets', (msg, widgets) => {
                this.setState({ widgets: widgets });
            });
            this.pubsubTokens.push(token);
        }
    }
    unsubscribe() {
        _.each(this.pubsubTokens, (token) => {
            pubsub.unsubscribe(token);
        });
        this.pubsubTokens = [];
    }
    handleDeleteWidget(widgetId) {
        let widgets = _.slice(this.state.widgets);
        _.remove(widgets, (n) => (n === widgetId));
        this.setState({ widgets: widgets });

        this.props.onDelete();
    }
    render() {
        const widgets = _.map(this.state.widgets, (widgetId) => (
            <Widget
                key={widgetId}
                data-widgetid={widgetId}
                onDelete={() => {
                    this.handleDeleteWidget(widgetId);
                }}
            />
        ));

        return (
            <div {...this.props}>{widgets}</div>
        );
    }
}

export default Sortable(SecondaryWidgets, sortableOptions);
