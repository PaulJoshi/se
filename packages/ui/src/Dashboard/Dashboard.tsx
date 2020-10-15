import React, { Component } from 'react';
import { createStyles, Divider, Grid, Theme, withStyles, WithStyles, Zoom } from '@material-ui/core';
import { AppProps } from '../App';
import Bar from '../Bar/Bar';
import ListOfStocks from './ListOfStocks/ListOfStocks';
import DetailView from './DetailView/DetailView';
import { UserStoreItemDetails } from '@se/api';
import { apiCall, getErrorMessage } from '../utils/Util';
import { Stock, OrderType } from '@se/core';

const styles = (theme: Theme) => createStyles({});

interface DashboardProps extends WithStyles<typeof styles>, AppProps {
  hidden: boolean;
}

interface State {
  user: UserStoreItemDetails;
  selectedStock?: Stock;
  selectedOrderType: OrderType;
}

class Dashboard extends Component<DashboardProps, State> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {
      user: {
        holdings: {},
        id: 0,
        orders: { placedBuyOrders: [], confirmedOrders: [], placedSellOrders: [] },
        username: '',
        wallet: { margin: 0 },
      },
      selectedOrderType: OrderType.Buy,
    };
  }

  fetchUserDetails = async () => {
    this.props.showBusyIndicator(true);
    try {
      const response = await apiCall('/v1/user/check', 'GET');
      const error = getErrorMessage(response);
      if (!error) {
        this.setState({
          ...this.state,
          user: response.data,
        });
      }
    } catch (ex) {
      this.props.showMessagePopup('error', ex.message);
    } finally {
      this.props.showBusyIndicator(false);
    }
  };

  updateSelectedStock = (selectedStock: Stock) => {
    setTimeout(() => { this.setState({...this.state, selectedStock }); }, 10);
  }

  updateSelectedOrderType = (selectedOrderType: OrderType) => {
    this.setState({...this.state, selectedOrderType });
  }

  async componentDidUpdate(prevProps: DashboardProps) {
    if (this.props.hidden !== prevProps.hidden) {
      this.fetchUserDetails();
    }
  }

  render() {
    const { hidden } = this.props;
    const { user, selectedOrderType, selectedStock } = this.state;
    const { updateSelectedStock, updateSelectedOrderType , fetchUserDetails } = this;
    return (
      <Zoom in={!hidden} style={{ height: '100vh' }}>
        <Grid container direction="column">
          <Grid item>
            <Bar />
          </Grid>
          <Grid item style={{ height: '93%' }}>
            <Grid container direction="row" style={{ height: '100%', justifyContent: 'space-around' }}>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
              <Grid item style={{ width: '30%' }}>
                <ListOfStocks {...{ updateSelectedStock, updateSelectedOrderType, ...this.props }} />
              </Grid>
              <Divider orientation="vertical" />
              <Grid item style={{ width: '69%' }}>
                <DetailView {...{ user, selectedOrderType, selectedStock, updateSelectedStock, updateSelectedOrderType, fetchUserDetails, ...this.props}} />
              </Grid>
              <Grid item>
                <Divider orientation="vertical" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
        </Grid>
      </Zoom>
    );
  }
}

export default withStyles(styles)(Dashboard);
