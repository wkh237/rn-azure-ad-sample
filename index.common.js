/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {ReactNativeAD, ADLoginView} from 'react-native-azure-ad'
const CLIENT_ID = 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx'
const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/authorize'
const ADContext = new ReactNativeAD({
      client_id : CLIENT_ID,
      // redirectUrl : 'http://localhost:8080',
      // Optional
      authority_host : AUTH_URL,
      // Optional
      // tenant  : 'common',
      // This is required if client_id is a web application id
      // but not recommended doing this way.
      // client_secret : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      resources : [
        'https://graph.microsoft.com',
      ]
    })

class rn_ad_sample extends Component {

  constructor(props) {
    super(props)
    this.state = {
      // this property will store user credential after logged in.
      info : null,
      // logout if this is true
      shouldLogout : false,
      // for display different views
      displayType : 'before_login'
    }

  }

  render() {
    return (
      <View style={styles.container}>
        {this._renderContent.bind(this)()}
      </View>
    );
  }

  _renderContent() {
    switch(this.state.displayType) {
      case 'before_login' :
        return <TouchableOpacity style={styles.button}
          onPress={(this._showADLogin.bind(this))}>
          <Text style={{color : 'white'}}>Login</Text>
        </TouchableOpacity>
      case 'login' :
        // In fact we care if it successfully redirect to the URI, because
        // we alread have the access_token after successfully logged in.
        // set `hideAfterLogin` to `true` so that it won't display an error page.
        return [
          <ADLoginView
            key="webview"
            hideAfterLogin={true}
            style={{flex :1}}
            needLogout={this.state.shouldLogout}
            context={ADContext}
            onURLChange={this._onURLChange.bind(this)}
            onSuccess={this._onLoginSuccess.bind(this)}/>]
      case 'after_login' :
        return [
          <Text key="text">You're logged in as {this.state.info} </Text>,
          <TouchableOpacity key="button" style={styles.button}
            onPress={(this._logout.bind(this))}>
            <Text style={{color : 'white'}}>Logout</Text>
          </TouchableOpacity>]
      break
    }
  }

  _onURLChange(e) {
    // listen to webview URL change, if the URL matches login URL redirect user
    // to start page.
    let isLoginPage = e.url === `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}`
    if(isLoginPage && this.state.shouldLogout) {
      console.log('logged out')
      this.setState({
        displayType : 'before_login',
        shouldLogout : false
      })
    }
  }

  _showADLogin() {
    this.setState({
      displayType : 'login'
    })
  }

  _logout() {
    this.setState({
      displayType : 'login',
      shouldLogout : true
    })
  }

  _onLoginSuccess(cred) {
    console.log('user credential', cred)
    let access_token = ADContext.getAccessToken('https://graph.microsoft.com')
    fetch('https://graph.microsoft.com/beta/me', {
      method : 'GET',
      headers : {
        Authorization : `bearer ${access_token}`
      }
    })
    .then(res => res.json())
    .then(user => {
      console.log(user)
      this.setState({
        displayType : 'after_login',
        info : user.displayName
      })
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button : {
    margin : 24,
    backgroundColor : '#1a6ed1',
    padding : 12
  },
});

AppRegistry.registerComponent('rn_ad_sample', () => rn_ad_sample);
