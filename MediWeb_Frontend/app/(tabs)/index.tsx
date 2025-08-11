import { View, Text, StyleSheet} from 'react-native'
import React from 'react'

const app = () => {
  return (
    <View style={style.container}>
      <Text style={style.text}>First Test Module</Text>  
    </View>
  )
}

export default app

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    color: 'white',
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  }
})