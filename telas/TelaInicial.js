import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, ImageBackground, View, Image, TextInput, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../style/estilo';
import { useNavigation } from '@react-navigation/native';

const TelaInicial = () => {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigation = useNavigation();
  
  const handleChangeText = (text, field) => {
    if (field === 'cpf') {
      setCpf(text);
    } else if (field === 'senha') {
      setSenha(text);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleNavigateToCadastro = () => {
    navigation.navigate('Cadastro');
  };

  const handleNavigateToHome = async () => {
    if (cpf === '' || senha === '') {
      setErrorMessage('Por favor, preencha todos os campos.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return;
    }

    try {
        const response = await fetch('http://10.0.2.2:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf, senha }),
        });

        if (response.ok) {
          const data = await response.json();

          const idUsuario = data.idUsuario;
          console.log('ID do usuário após o login:', idUsuario);

          const nomeCompletoUsuario = data.nomeUsuario;
          const partesNome = nomeCompletoUsuario.split(' ');
          const primeiroNomeUsuario = partesNome[0];
          
          navigation.navigate('Home', { nomeUsuario: primeiroNomeUsuario, idUsuario });
        } else {
          setErrorMessage('CPF ou senha inválidos!');
          setTimeout(() => {
            setErrorMessage('');
          }, 3000);
        }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrorMessage('Ocorreu um erro ao fazer login. Por favor, tente novamente mais tarde.');
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView>
        <View style={styles.container}>
          <ImageBackground
            source={require('../assets/img/img_fundo.png')}
            style={styles.imagemFundo}
            resizeMode="cover"
          >
            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <Image
                  source={require('../assets/img/logo.png')}
                  style={styles.logo}
                />
                </View>
                <Text style={styles.titulo}>
                OBRA {"\n"}
                PRIMA
                </Text>
                <View>
                    <Text style={styles.texto}>CPF</Text>
                    <TextInput
                    style={styles.input}
                    onChangeText={(text) => handleChangeText(text, 'cpf')}
                    value={cpf}
                    placeholder="Digite o seu CPF"
                    keyboardType="numeric"
                    maxLength={14}
                />
                <Text style={styles.texto}>Senha</Text>
                <View>
                  <TextInput
                    style={styles.input}
                    onChangeText={(text) => handleChangeText(text, 'senha')}
                    value={senha}
                    placeholder="Digite sua senha"
                    maxLength={14}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.iconContainer} onPress={toggleShowPassword}>
                    <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={24} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
              ) : null}
              <TouchableOpacity
                  style={styles.buttonPrincipal}
                  onPress={handleNavigateToHome}
                  accessibilityLabel="Botão para acessar a aplicação"
                  activeOpacity={0.8}
              >
                <Text style={styles.buttonTextPrincipal}>Acessar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.buttonSecundario}
                  onPress={() => {}}
                  accessibilityLabel="Botão para recuperar senha"
                  activeOpacity={0.8}
              >
                <Text style={styles.buttonTextSecundario}>Recuperar senha</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.buttonSecundario}
                  onPress={handleNavigateToCadastro}
                  accessibilityLabel="Botão para se cadastrar"
                  activeOpacity={0.8}
              >
                <Text style={styles.buttonTextSecundario}>Cadastrar</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default TelaInicial;
