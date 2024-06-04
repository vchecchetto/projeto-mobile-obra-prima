import React, { useState } from "react";
import { KeyboardAvoidingView, ScrollView, Platform, ImageBackground, View, Image, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../style/estilo';
import axios from 'axios';

const TelaCadastro = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [cpf, setCpf] = useState('');
    const [emailUsuario, setEmailUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const limparCampos = () => {
        setNomeUsuario('');
        setCpf('');
        setEmailUsuario('');
        setSenha('');
        setConfirmarSenha('');
    };
    
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g,'');
        if(cpf === '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
        let add = 0;
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10))) return false;
        return true;
    };
    
    const cadastrarUsuario = async () => {
        if (!validarCPF(cpf)) {
            Alert.alert('CPF Inválido', 'Por favor, insira um CPF válido.');
            return;
        }
        try {
            const response = await axios.post('http://10.0.2.2:3000/cadastro', {
                nomeUsuario,
                cpf,
                emailUsuario,
                senha
            });
    
            limparCampos();
    
            console.log('Cadastro realizado com sucesso:', response.data);
        } catch (error) {
            console.error('Erro no cadastro:', error);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
                <View style={styles.containerCadastro}>
                    <ImageBackground
                    source={require('../assets/img/img_fundo.png')}
                    style={styles.imagemFundo}
                    resizeMode="cover"
                    >
                        <View style={styles.contentCabecalhoCadastro}>
                            <View style={styles.imageContainerCadastro}>
                                <Image
                                source={require('../assets/img/logo.png')}
                                style={styles.logo}
                                />
                            </View>
                            <Text style={styles.tituloCadastro}>
                                Cadastro
                            </Text>
                        </View>
                        <View style={styles.contentFormularioCadastro}>
                            <Text style={styles.textoCadastro}>Nome Completo</Text>
                            <TextInput
                                style={styles.inputCadastro}
                                placeholder="Digite o seu nome completo"
                                value={nomeUsuario}
                                onChangeText={setNomeUsuario}
                            />
                            <Text style={styles.textoCadastro}>CPF</Text>
                            <TextInput
                                style={styles.inputCadastro}
                                placeholder="Digite o seu CPF"
                                value={cpf}
                                onChangeText={(text) => {
                                    const formattedText = text.replace(/\D/g, '');
                                    setCpf(formattedText);
                                }}
                                keyboardType="numeric"
                            />
                            <Text style={styles.textoCadastro}>E-Mail</Text>
                            <TextInput
                                style={styles.inputCadastro}
                                placeholder="Digite o seu e-mail"
                                value={emailUsuario}
                                onChangeText={setEmailUsuario}
                            />
                            <Text style={styles.textoCadastro}>Senha</Text>
                            <TextInput
                                style={styles.inputCadastro}
                                placeholder="Digite a senha"
                                secureTextEntry={!showPassword}
                                value={senha}
                                onChangeText={setSenha}
                                maxLength={14}
                            />
                            <Text style={styles.textoCadastro}>Confirmar Senha</Text>
                            <TextInput
                                style={styles.inputCadastro}
                                placeholder="Confirme a senha"
                                secureTextEntry={!showPassword}
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                                maxLength={14}
                            />
                        </View>
                        <View style={styles.contentBotoesCadastro}>
                        <TouchableOpacity
                            style={styles.buttonPrincipal}
                            onPress={cadastrarUsuario}
                            accessibilityLabel="Botão para confirmar cadastro"
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonTextPrincipal}>Cadastrar</Text>
                        </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.buttonSecundario}
                                onPress={limparCampos}
                                accessibilityLabel="Botão para limpar os campos"
                                activeOpacity={0.8}
                            >
                                <Text style={styles.buttonTextSecundario}>Limpar Formulário</Text>
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default TelaCadastro;
