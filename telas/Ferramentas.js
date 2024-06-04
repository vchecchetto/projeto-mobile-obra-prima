import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, TextInput, TouchableOpacity, Text,  Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { styles } from '../style/estilo';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const Ferramentas = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [isFormVisible, setIsFormVisible] = useState(false);

    const [clientesServ, setClientesServ] = useState([]);
    const [ferramentas, setFerramentas] = useState([]);
    
    const [nomeFerramenta, setNomeFerramenta] = useState('');
    const [localizacao, setLocalizacao] = useState('Em posse'); 
    const [outrasInfo, setOutrasInfo] = useState('');

    const [ferramentaEditando, setFerramentaEditando] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    const { idUsuario } = route.params || {};

    const heightAnimation = new Animated.Value(0);

    const toggleForm = (ferramenta = null) => {
        setIsFormVisible(!isFormVisible);
        setErrorMessage('');
        if (ferramenta) {
            setNomeFerramenta(ferramenta.nomeFerramenta);
            setLocalizacao(ferramenta.localizacao);
            setOutrasInfo(ferramenta.outrasInfo);
            setFerramentaEditando(ferramenta);
        } else {
            limparCamposFerr();
            setFerramentaEditando(null);
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

    const handleNomeFerramentaChange = (text) => {
        setNomeFerramenta(text);
        if (errorMessage) {
            setErrorMessage('');
        }
    };
    
    const handleLocalizacaoChange = (value) => {
        setLocalizacao(value);
        if (errorMessage) {
            setErrorMessage('');
        }
    };
    
    const cadastrarFerramenta = async () => {
        if (!nomeFerramenta || !localizacao) {
            setErrorMessage('Por favor, preencha o nome da ferramenta e sua localização.');
            return;
        }
    
        try {
            if (ferramentaEditando) {
                await axios.put(`http://10.0.2.2:3000/cadastro-ferramenta/${ferramentaEditando.idFerramenta}`, {
                    nomeFerramenta,
                    localizacao,
                    outrasInfo,
                    idUsuario,
                });
                const updatedFerramentas = ferramentas.map(f => 
                    f.idFerramenta === ferramentaEditando.idFerramenta 
                        ? { ...f, nomeFerramenta, localizacao, outrasInfo }
                        : f
                );
                setFerramentas(updatedFerramentas);
                console.log('Ferramenta atualizada com sucesso');
            } else {
                const response = await axios.post('http://10.0.2.2:3000/cadastro-ferramenta', {
                    nomeFerramenta,
                    localizacao,
                    outrasInfo,
                    idUsuario,
                });
                setFerramentas([...ferramentas, response.data]);
                console.log('Cadastro de ferramenta realizado com sucesso:', response.data);
            }
            limparCamposFerr();
            toggleForm();
        } catch (error) {
            console.error('Erro no cadastro de ferramenta:', error);
        }
    };
   
    const excluirFerramenta = async () => {
        try {
            await axios.delete(`http://10.0.2.2:3000/cadastro-ferramenta/${ferramentaEditando.idFerramenta}`);
            const updatedFerramentas = ferramentas.filter(f => f.idFerramenta !== ferramentaEditando.idFerramenta);
            setFerramentas(updatedFerramentas);
            limparCamposFerr();
            toggleForm();
            console.log('Ferramenta excluída com sucesso');
        } catch (error) {
            console.error('Erro ao excluir ferramenta:', error);
        }
    };

    const limparCamposFerr = () => {
        setNomeFerramenta('');
        setLocalizacao('Em posse');
        setOutrasInfo('');
        setFerramentaEditando(null);
    };

    const botaoAdicionarCancelar = () => {
        setIsFormVisible(!isFormVisible);
    };

    useEffect(() => {
        const fetchFerramentas = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:3000/cadastro-ferramenta');
                setFerramentas(response.data);
            } catch (error) {
                console.error('Erro ao buscar ferramentas:', error);
            }
        };
        fetchFerramentas();
    }, []);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:3000/cadastro-cliente');
                const clientesOrdenados = response.data.sort((a, b) => a.nomeCliente.localeCompare(b.nomeCliente));
                setClientesServ(clientesOrdenados);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
            }
        };
        fetchClientes();
    }, []);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: '#252525'}}>
                <View style={styles.containerTelaPadrao}>
                    <Animated.View style={[styles.clientListContainer, { height: heightAnimation }]}>
                        <Text>Lista de Ferramentas</Text>
                    </Animated.View>
                    {isFormVisible && (
                        <View>
                            <View style={styles.contentFormulario}>
                                <Text style={styles.tituloPadrao}>{ferramentaEditando ? 'EDITAR FERRAMENTA' : 'ADICIONAR FERRAMENTA'}</Text>
                                <Text style={styles.subTituloPadrao}>Nome</Text>
                                <TextInput
                                    style={{ 
                                        height: 40, 
                                        borderColor: 'gray', 
                                        fontSize: 16, 
                                        borderWidth: 1, 
                                        borderRadius: 5, 
                                        paddingVertical: 5, 
                                        paddingHorizontal: 10 
                                    }}
                                    placeholder="Nome da Ferramenta"
                                    value={nomeFerramenta}
                                    onChangeText={handleNomeFerramentaChange}
                                />
                                <Text style={styles.subTituloPadrao}>Localização</Text>
                                <View style={styles.contentPicker}>
                                    <Picker
                                        selectedValue={localizacao}
                                        onValueChange={handleLocalizacaoChange}
                                    >
                                        <Picker.Item style={styles.pickerClientes} label="Em posse" value="Em posse" />
                                        {clientesServ.map((cliente) => 
                                            <Picker.Item style={styles.pickerClientes} key={cliente.idCliente} label={cliente.nomeCliente} value={cliente.idCliente} />
                                        )}
                                    </Picker>
                                </View>
                                <Text style={styles.subTituloPadrao}>Outras Informações</Text>
                                <TextInput
                                    style={{ 
                                        height: 40, 
                                        borderColor: 'gray', 
                                        fontSize: 16, 
                                        borderWidth: 1, 
                                        borderRadius: 5, 
                                        paddingVertical: 5, 
                                        paddingHorizontal: 10 
                                    }}
                                    placeholder="Outras informações"
                                    value={outrasInfo}
                                    onChangeText={setOutrasInfo}
                                />
                                {errorMessage ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                ) : null}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity style={styles.botaoPadraoB} onPress={cadastrarFerramenta}>
                                        <MaterialIcons name="save" size={32} color="#fefaf1" />
                                    </TouchableOpacity>
                                    {ferramentaEditando && (
                                        <TouchableOpacity style={styles.botaoPadraoB} onPress={excluirFerramenta}>
                                            <MaterialIcons name="delete" size={32} color="#fefaf1" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity style={styles.botaoPadrao} onPress={() => toggleForm()}>
                            {isFormVisible ? 
                                <MaterialIcons name="cancel" size={24} color="#780000" /> :
                                <MaterialIcons name="add-circle" size={24} color="black" />
                            }
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentListaClientes}>
                        <Text style={styles.tituloPadrao}>MINHAS FERRAMENTAS</Text>
                        <View style={{ flexDirection: 'column' }}>
                        {ferramentas
                                .slice()
                                .sort((a, b) => a.nomeFerramenta.localeCompare(b.nomeFerramenta))
                                .map((ferramenta, index) => (
                                    <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }} onPress={() => toggleForm(ferramenta)}>
                                        <Text style={styles.subTituloPadrao}>{ferramenta.nomeFerramenta}</Text>
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

export default Ferramentas;