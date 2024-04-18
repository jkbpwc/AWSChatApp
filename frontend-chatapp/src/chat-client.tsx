import React from 'react'
import { Button } from '@material-ui/core';
import ListItemText from '@material-ui/core/ListItemText';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';

interface Props {
  isConnected: boolean;
  members: string[];
  chatRows: React.ReactNode[];
  onPublicMessage: () => void;
  onPrivateMessage: (to: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  username:any
}

export const ChatClient = (props: Props) => {
  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: '#fff3e6',
      display: 'flex',
      alignItems: 'center',
    }}>
      <CssBaseline />
      <Container maxWidth="lg" style={{ height: '90%' }}>
        <Grid container style={{ height: '100%' }}>
          <Grid item xs={2} style={{ backgroundColor: '#ff9933', color: 'white'}}>
            <List component="nav" style={{ flex: 1, padding: 30}}>
              {/* {props.members.map(item =>
                <ListItem key={item} onClick={() => { props.onPrivateMessage(item); }} button>
                  <ListItemText style={{ fontWeight: 800 }} primary={item} />
                </ListItem>
              )} */}
              <p style={{overflowWrap: 'break-word'}}>{props.username}</p>
            </List>
          </Grid>
          <Grid style={{ position: 'relative'}} item container direction="column" xs={10} >
            
            <Paper style={{ flex: 1, backgroundColor:'#f2f2f2'}}>
              <Grid item container style={{ height: '100%' }} direction="column">
                <Grid item container style={{ flex: 1}}>
                  <ul style={{
                    paddingTop: 20,
                    paddingLeft: 44,
                    listStyleType: 'none',
                  }}>
                    {props.chatRows.map((item, i) =>
                      <li key={i} style={{ marginTop:20,padding: 9 , backgroundColor: '#ffe6cc', borderRadius:10}}>{item}</li>
                    )}
                  </ul>
                </Grid>
                <Grid item style={{ margin: 10 }}>
                  {props.isConnected && <Button style={{ marginRight: 7 }} variant="outlined" size="small" disableElevation onClick={props.onPublicMessage}>Send Public Message</Button>}
                  {props.isConnected && <Button style={{ marginRight: 7 }} variant="outlined" size="small" disableElevation onClick={props.onDisconnect}>Disconnect</Button>}
                  {props.isConnected && <Button variant="outlined" size="small" disableElevation onClick={props.onPrivateMessage}>Send Private Message</Button>}
                  {!props.isConnected && <Button variant="outlined" size="small" disableElevation onClick={props.onConnect}>Connect</Button>}
                </Grid>
              </Grid>
              <div style={{
                position: 'absolute',
                right: 9,
                top: 8,
                width: 12,
                height: 12,
                backgroundColor: props.isConnected ? '#00da00' : '#e2e2e2',
                borderRadius: 50,
              }} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div >
  )
};