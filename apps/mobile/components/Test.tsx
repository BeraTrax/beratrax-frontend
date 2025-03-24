// For React Native
import { Wow } from "@beratrax/ui"
import { StyleSheet, View } from 'react-native'

export default function Test() {
  return (
    <View style={styles.container}>
      <Wow />
      {/* <Flex>
      <Card variant="secondary" size="medium" style={styles.card}>
        <Text style={styles.cardText}>Secondary Card</Text>
      </Card>
      
      <Card variant="dark" size="medium" style={styles.card}>
          <Text style={styles.cardText}>Dark Card</Text>
        </Card>
      </Flex> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    color:"#fff"
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontWeight: 'bold',
  }
})