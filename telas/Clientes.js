import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../style/estilo';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import axios from 'axios';

const Clientes = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [nomeCliente, setNomeCliente] = useState('');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [endereco, setEndereco] = useState('');
    const [bairro, setBairro] = useState('');
    const [municipio, setMunicipio] = useState('');
    const [estado, setEstado] = useState('');
    const [celular, setCelular] = useState('');
    const [emailCliente, setEmailCliente] = useState('');
    const [clientes, setClientes] = useState([]);
    const [clienteEditando, setClienteEditando] = useState(null);
    const { idUsuario } = route.params || {};

    const [errorMessage, setErrorMessage] = useState('');

    const heightAnimation = new Animated.Value(0);

    const toggleForm = (cliente = null) => {
        setIsFormVisible(!isFormVisible);
        if (cliente) {
            setNomeCliente(cliente.nomeCliente);
            setCpfCnpj(cliente.cpfCnpj);
            setEndereco(cliente.endereco);
            setBairro(cliente.bairro);
            setMunicipio(cliente.municipio);
            setEstado(cliente.estado);
            setCelular(cliente.celular);
            setEmailCliente(cliente.emailCliente);
            setClienteEditando(cliente);
        } else {
            limparCampos();
            setClienteEditando(null);
        }
        Animated.timing(
            heightAnimation,
            {
                toValue: isFormVisible ? 0 : 300,
                duration: 300,
                useNativeDriver: false,
            }
        ).start();
    };

    const limparCampos = () => {
        setNomeCliente('');
        setCpfCnpj('');
        setEndereco('');
        setBairro('');
        setMunicipio('');
        setEstado('');
        setCelular('');
        setEmailCliente('');
    };

    const validarCpfCnpj = (cpfCnpj) => {
        cpfCnpj = cpfCnpj.replace(/[^\d]+/g, '');
    
        if (cpfCnpj.length === 11) {
            if (cpfCnpj === '' || /^(\d)\1{10}$/.test(cpfCnpj)) return false;
            let add = 0;
            for (let i = 0; i < 9; i++) add += parseInt(cpfCnpj.charAt(i)) * (10 - i);
            let rev = 11 - (add % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(cpfCnpj.charAt(9))) return false;
            add = 0;
            for (let i = 0; i < 10; i++) add += parseInt(cpfCnpj.charAt(i)) * (11 - i);
            rev = 11 - (add % 11);
            if (rev === 10 || rev === 11) rev = 0;
            if (rev !== parseInt(cpfCnpj.charAt(10))) return false;
            return true;
        } else if (cpfCnpj.length === 14) {
            if (cpfCnpj === '' || /^(\d)\1{13}$/.test(cpfCnpj)) return false;
            let tamanho = cpfCnpj.length - 2;
            let numeros = cpfCnpj.substring(0, tamanho);
            let digitos = cpfCnpj.substring(tamanho);
            let soma = 0;
            let pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) return false;
            
            tamanho = tamanho + 1;
            numeros = cpfCnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (let i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) return false;
            
            return true;
        } else {
            return false;
        }
    };

    const cadastrarCliente = async () => {
        if (!nomeCliente || !cpfCnpj || !endereco || !bairro || !municipio || !estado || !celular || !emailCliente) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        if (!validarCpfCnpj(cpfCnpj)) {
            setErrorMessage('CPF/CNPJ inválido.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }

        if (!validarCelular(celular)) {
            return;
        }
    
        const clienteExistente = await verificarClienteExistente(cpfCnpj);
        if (clienteExistente && !clienteEditando) {
            setErrorMessage('Já existe um cliente com este CPF/CNPJ.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        try {
            const tipoCliente = cpfCnpj.length === 11 ? 'Pessoa Física' : 'Pessoa Jurídica';
    
            if (clienteEditando) {
                await axios.put(`http://10.0.2.2:3000/cadastro-cliente/${clienteEditando.idCliente}`, {
                    nomeCliente,
                    cpfCnpj,
                    endereco,
                    bairro,
                    municipio,
                    estado,
                    celular,
                    emailCliente,
                    tipoCliente,
                    idUsuario,
                });
                const updatedClientes = clientes.map(c => 
                    c.idCliente === clienteEditando.idCliente 
                        ? { ...c, nomeCliente, cpfCnpj, endereco, bairro, municipio, estado, celular, emailCliente }
                        : c
                );
                setClientes(updatedClientes);
                console.log('Cliente atualizado com sucesso');
            } else {
                const response = await axios.post('http://10.0.2.2:3000/cadastro-cliente', {
                    nomeCliente,
                    cpfCnpj,
                    endereco,
                    bairro,
                    municipio,
                    estado,
                    celular,
                    emailCliente,
                    tipoCliente,
                    idUsuario,
                });
                setClientes([...clientes, response.data]);
                console.log('Cadastro de cliente realizado com sucesso:', response.data);
            }
    
            limparCampos();
            toggleForm();
        } catch (error) {
            console.error('Erro no cadastro de cliente:', error);
        }
    };

    const validarCelular = (celular) => {
        const celularNumerico = celular.replace(/[^\d]/g, '');
        if (celularNumerico.length !== 11) {
            setErrorMessage('O celular deverá ter 11 digitos: \n(DDD + Celular).');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return false;
        }
        if (!/^\d+$/.test(celular)) {
            setErrorMessage('Digite o celular com apenas números.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return false;
        }
        return true;
    };
    
    const verificarClienteExistente = async (cpfCnpj) => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/cadastro-cliente');
            return response.data.some(cliente => cliente.cpfCnpj === cpfCnpj);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            return false;
        }
    };
   
    const excluirCliente = async () => {
        try {
            await axios.delete(`http://10.0.2.2:3000/cadastro-cliente/${clienteEditando.idCliente}`);
            const updatedClientes = clientes.filter(c => c.idCliente !== clienteEditando.idCliente);
            setClientes(updatedClientes);
            limparCampos();
            toggleForm();
            console.log('Cliente excluído com sucesso');
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
        }
    };

    const confirmarExclusaoCliente = () => {
        Alert.alert(
            'Confirmação',
            'Você tem certeza que deseja excluir este cliente?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => console.log('Exclusão cancelada'),
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    onPress: () => excluirCliente(),
                    style: 'destructive'
                }
            ],
            { cancelable: false }
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:3000/cadastro-cliente');
                setClientes(response.data);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        };
        fetchData();
    }, []);

    const botaoAdicionarCancelar = () => {
        setIsFormVisible(!isFormVisible);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: '#252525'}}>
                <View style={styles.containerTelaPadrao}>
                    <View>
                        <Animated.View style={[styles.clientListContainer, { height: heightAnimation }]}>
                            <Text>Lista de Clientes</Text>
                        </Animated.View>
                        {isFormVisible && (
                            <View style={styles.contentFormulario}>
                                <Text style={styles.tituloPadrao}>ADICIONAR CLIENTE</Text>
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="Nome Completo"
                                    value={nomeCliente}
                                    onChangeText={setNomeCliente}
                                />
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="CPF/CNPJ"
                                    value={cpfCnpj}
                                    onChangeText={setCpfCnpj}
                                />
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="Endereço"
                                    value={endereco}
                                    onChangeText={setEndereco}
                                />
                                <View style={styles.contentPickerB}>
                                    <Picker
                                        selectedValue={estado}
                                        onValueChange={(value) => setEstado(value)}
                                        style={Platform.OS === 'ios' ? styles.inputIOS : styles.inputAndroid}
                                    >
                                        <Picker.Item style={styles.pickerEstados} label="Selecione o Estado" value="" />
                                        <Picker.Item style={styles.pickerEstados} label="Acre" value="AC" />
                                        <Picker.Item style={styles.pickerEstados} label="Alagoas" value="AL" />
                                        <Picker.Item style={styles.pickerEstados} label="Amapá" value="AP" />
                                        <Picker.Item style={styles.pickerEstados} label="Amazonas" value="AM" />
                                        <Picker.Item style={styles.pickerEstados} label="Bahia" value="BA" />
                                        <Picker.Item style={styles.pickerEstados} label="Ceará" value="CE" />
                                        <Picker.Item style={styles.pickerEstados} label="Distrito Federal" value="DF" />
                                        <Picker.Item style={styles.pickerEstados} label="Espírito Santo" value="ES" />
                                        <Picker.Item style={styles.pickerEstados} label="Goiás" value="GO" />
                                        <Picker.Item style={styles.pickerEstados} label="Maranhão" value="MA" />
                                        <Picker.Item style={styles.pickerEstados} label="Mato Grosso" value="MT" />
                                        <Picker.Item style={styles.pickerEstados} label="Mato Grosso do Sul" value="MS" />
                                        <Picker.Item style={styles.pickerEstados} label="Minas Gerais" value="MG" />
                                        <Picker.Item style={styles.pickerEstados} label="Pará" value="PA" />
                                        <Picker.Item style={styles.pickerEstados} label="Paraíba" value="PB" />
                                        <Picker.Item style={styles.pickerEstados} label="Paraná" value="PR" />
                                        <Picker.Item style={styles.pickerEstados} label="Pernambuco" value="PE" />
                                        <Picker.Item style={styles.pickerEstados} label="Piauí" value="PI" />
                                        <Picker.Item style={styles.pickerEstados} label="Rio de Janeiro" value="RJ" />
                                        <Picker.Item style={styles.pickerEstados} label="Rio Grande do Norte" value="RN" />
                                        <Picker.Item style={styles.pickerEstados} label="Rio Grande do Sul" value="RS" />
                                        <Picker.Item style={styles.pickerEstados} label="Rondônia" value="RO" />
                                        <Picker.Item style={styles.pickerEstados} label="Roraima" value="RR" />
                                        <Picker.Item style={styles.pickerEstados} label="Santa Catarina" value="SC" />
                                        <Picker.Item style={styles.pickerEstados} label="São Paulo" value="SP" />
                                        <Picker.Item style={styles.pickerEstados} label="Sergipe" value="SE" />
                                        <Picker.Item style={styles.pickerEstados} label="Tocantins" value="TO" />
                                    </Picker>
                                </View>
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="Município"
                                    value={municipio}
                                    onChangeText={setMunicipio}
                                />     
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="Bairro"
                                    value={bairro}
                                    onChangeText={setBairro}
                                />                                                    
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="Celular com DDD"
                                    value={celular}
                                    onChangeText={setCelular}
                                    keyboardType="numeric"
                                />
                                <TextInput
                                    style={styles.inputPadrao}
                                    placeholder="E-mail"
                                    value={emailCliente}
                                    onChangeText={setEmailCliente}
                                />
                                {errorMessage ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                ) : null}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity style={styles.botaoPadraoB} onPress={cadastrarCliente}>
                                        <MaterialIcons name="save" size={32} color="#fefaf1" />
                                    </TouchableOpacity>                                   
                                    {clienteEditando && (
                                        <TouchableOpacity style={styles.botaoPadraoB} onPress={confirmarExclusaoCliente}>
                                            <MaterialIcons name="delete" size={32} color="#fefaf1" />
                                        </TouchableOpacity>
                                    )}
                                </View>                                
                            </View>
                        )}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={styles.botaoPadrao} onPress={() => toggleForm()} >
                                {isFormVisible ? 
                                    <MaterialIcons name="cancel" size={24} color="#780000" /> :
                                    <MaterialIcons name="person-add" size={24} color="black" />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.contentListaClientes}>
                        <Text style={styles.tituloPadrao}>MEUS CLIENTES</Text>
                        <View style={{ flexDirection: 'column' }}>
                            {clientes
                                .slice()
                                .sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente))
                                .map((cliente, index) => (
                                    <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }} onPress={() => toggleForm(cliente)}>
                                        <Text style={styles.subTituloPadrao}>{cliente.nomeCliente}</Text>
                                        <MaterialIcons name="edit" size={24} color="black" />
                                    </TouchableOpacity>
                                ))
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Clientes;
