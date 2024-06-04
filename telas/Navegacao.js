import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TelaInicial from '../telas/TelaInicial';
import TelaCadastro from '../telas/TelaCadastro';
import Home from '../telas/Home';
import Calendario from '../telas/Calendario';
import Clientes from '../telas/Clientes';
import Ferramentas from '../telas/Ferramentas';
import Pagamentos from '../telas/Pagamentos';
import Servicos from '../telas/Servicos';
import Perfil from '../telas/Perfil';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TelaInicial">
        <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Agenda" component={Calendario} />
        <Stack.Screen name="Clientes" component={Clientes} />
        <Stack.Screen name="Ferramentas" component={Ferramentas} />
        <Stack.Screen name="Pagamentos" component={Pagamentos} />
        <Stack.Screen name="Obras" component={Servicos} />
        <Stack.Screen name="Perfil" component={Perfil} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
