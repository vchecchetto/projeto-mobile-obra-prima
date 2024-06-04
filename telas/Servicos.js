import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, TextInput, TouchableOpacity, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../style/estilo';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import axios from 'axios';

const Servicos = () => {
    const navigation = useNavigation();
    const [clientesServ, setClientesServ] = useState([]);
    const [servicosLista, setServicosLista] = useState([]);
    const [idClienteSelecionado, setIdClienteSelecionado] = useState(null);
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [valorTotal, setValorTotal] = useState('');
    const [showDataInicioPicker, setShowDataInicioPicker] = useState(false);
    const [showDataFimPicker, setShowDataFimPicker] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [servicoEditando, setServicoEditando] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const heightAnimation = new Animated.Value(0);

    const cadastrarServico = async () => {
        if (!idClienteSelecionado || !valorTotal || !dataInicio || !dataFim) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        if (dataFim < dataInicio) {
            setErrorMessage('O término do serviço não pode ser anterior que o início.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        if (verificarConflitoDatas(dataInicio, dataFim)) {
            setErrorMessage('Já existe um serviço agendado para essa data.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        try {
            const response = await axios.post('http://10.0.2.2:3000/cadastro-servico', {
                dataInicio,
                dataFim,
                valorTotal,
                idCliente: idClienteSelecionado,
            });
            console.log('Cadastro de serviço realizado com sucesso:', response.data);
            limparCamposServ();
            await atualizarListaServicos(); 
            toggleForm();
        } catch (error) {
            console.error('Erro no cadastro de serviço:', error);
        }
    };
    
    const editarServico = async () => {
        if (!idClienteSelecionado || !valorTotal || !dataInicio || !dataFim) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        if (dataFim < dataInicio) {
            setErrorMessage('O término do serviço não pode ser anterior que o início.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        if (verificarConflitoDatas(dataInicio, dataFim, servicoEditando.idServico)) {
            setErrorMessage('Já existe um serviço agendado para essa data.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }
    
        try {
            const response = await axios.put(`http://10.0.2.2:3000/cadastro-servico/${servicoEditando.idServico}`, {
                dataInicio,
                dataFim,
                valorTotal,
                idCliente: idClienteSelecionado,
            });
            console.log('Serviço editado com sucesso:', response.data);
            limparCamposServ();
            await atualizarListaServicos();
            toggleForm(); 
        } catch (error) {
            console.error('Erro ao editar serviço:', error);
        }
    };
     
    const verificarConflitoDatas = (dataInicio, dataFim, idServico = null) => {
        for (let servico of servicosLista) {
            if (idServico && servico.idServico === idServico) continue;
    
            const inicioServico = new Date(servico.dataInicio);
            const fimServico = new Date(servico.dataFim);
    
            if (
                (dataInicio >= inicioServico && dataInicio <= fimServico) ||
                (dataFim >= inicioServico && dataFim <= fimServico) ||
                (dataInicio <= inicioServico && dataFim >= fimServico)
            ) {
                return true;
            }
        }
        return false;
    };
    
    const atualizarListaServicos = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/cadastro-servico');
            setServicosLista(response.data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
        }
    };
    
    const excluirServico = async () => {
        try {
            if (!servicoEditando) return;
    
            await axios.delete(`http://10.0.2.2:3000/cadastro-servico/${servicoEditando.idServico}`);
            const updatedServicos = servicosLista.filter(c => c.idServico !== servicoEditando.idServico);
            setServicosLista(updatedServicos);
            limparCamposServ();
            setIsFormVisible(false);
            console.log('Serviço excluído com sucesso');
        } catch (error) {
            console.error('Erro ao excluir serviço:', error);
        }
    };

    const confirmarExclusaoServ = () => {
        Alert.alert(
            'Confirmação',
            'Você tem certeza que deseja excluir este serviço?',
            [
                {
                    text: 'Cancelar',
                    onPress: () => console.log('Exclusão cancelada'),
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    onPress: () => excluirServico(),
                    style: 'destructive'
                }
            ],
            { cancelable: false }
        );
    };
   
    const limparCamposServ = () => {
        setIdClienteSelecionado(null);
        setDataInicio(new Date());
        setDataFim(new Date());
        setValorTotal('');
    };
    
    const onChangeDataInicio = (event, selectedDate) => {
        const currentDate = selectedDate || dataInicio;
        setShowDataInicioPicker(Platform.OS === 'ios');
        setDataInicio(currentDate);
    };
    
    const onChangeDataFim = (event, selectedDate) => {
        const currentDate = selectedDate || dataFim;
        setShowDataFimPicker(Platform.OS === 'ios');
        setDataFim(currentDate);
    };

    const handleShowDataInicioPicker = () => {
        setShowDataInicioPicker(true);
    };

    const handleShowDataFimPicker = () => {
        setShowDataFimPicker(true);
    };

    const botaoAdicionarCancelar = () => {
        setIsFormVisible(!isFormVisible);
    };

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:3000/cadastro-servico');
                setServicosLista(response.data);
            } catch (error) {
                console.error('Erro ao buscar serviços:', error);
            }
        };
        fetchData();
    }, []);

    const toggleForm = (servico = null) => {
        setIsFormVisible(!isFormVisible);
        if (servico) {
            setIdClienteSelecionado(servico.idCliente);
            setDataInicio(new Date(servico.dataInicio));
            setDataFim(new Date(servico.dataFim));
            setValorTotal(servico.valorTotal.toString());
            setServicoEditando(servico);
        } else {
            limparCamposServ();
            setServicoEditando(null);
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

    const servicosVigentes = servicosLista.filter(servico => new Date(servico.dataFim) >= new Date());
    const servicosConcluidos = servicosLista.filter(servico => new Date(servico.dataFim) < new Date());

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: '#252525'}}>
                <View style={styles.containerTelaPadrao}>
                    <Animated.View style={[styles.clientListContainer, { height: heightAnimation }]}>
                        <Text>Lista de Clientes</Text>
                    </Animated.View>
                    {isFormVisible && (
                        <View>
                            <View style={styles.contentFormulario}>
                                <Text style={styles.tituloPadrao}>ADICIONAR SERVIÇO</Text>
                                <Text style={styles.subTituloPadrao}>Cliente</Text>
                                <View style={styles.contentPicker}>
                                    <Picker
                                        selectedValue={idClienteSelecionado}
                                        onValueChange={(itemValue) => setIdClienteSelecionado(itemValue)}
                                    >
                                        <Picker.Item style={styles.pickerClientes} label="Selecione um cliente" value={null} />
                                        {clientesServ.map((cliente) => 
                                            <Picker.Item style={styles.pickerClientes} key={cliente.idCliente} label={cliente.nomeCliente} value={cliente.idCliente} />
                                        )}
                                    </Picker>
                                </View>
                                <Text style={styles.subTituloPadrao}>Data de Início</Text>
                                <TouchableOpacity style={styles.dataInput} onPress={handleShowDataInicioPicker}>
                                    <Text style={styles.subTituloPadraoB}>{dataInicio.toLocaleDateString('pt-BR')}</Text>
                                </TouchableOpacity>
                                {showDataInicioPicker && (
                                    <DateTimePicker
                                    testID="dateTimePicker"
                                    value={dataInicio}
                                    mode="date"
                                    is24Hour={true}
                                    display="default"
                                    onChange={onChangeDataInicio}
                                    />
                                )}
                                <Text style={styles.subTituloPadrao}>Data de Fim</Text>
                                <TouchableOpacity style={styles.dataInput} onPress={handleShowDataFimPicker}>
                                    <Text style={styles.subTituloPadraoB}>{dataFim.toLocaleDateString('pt-BR')}</Text>
                                </TouchableOpacity>
                                {showDataFimPicker && (
                                    <DateTimePicker                  
                                        testID="dateTimePicker"
                                        value={dataFim}
                                        mode="date"
                                        is24Hour={true}
                                        display="default"
                                        onChange={onChangeDataFim}
                                    />
                                )}
                                <Text style={styles.subTituloPadrao}>Valor</Text>
                                <TextInput
                                    style={{ 
                                        height: 40, 
                                        textAlign: 'center', 
                                        borderColor: 'gray', 
                                        fontSize: 16, 
                                        borderWidth: 1, 
                                        borderRadius: 5, 
                                        paddingVertical: 5, 
                                        paddingHorizontal: 10 
                                    }}
                                    placeholder="R$"
                                    value={valorTotal}
                                    onChangeText={setValorTotal}
                                    keyboardType="numeric"
                                />
                                {errorMessage ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                ) : null}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity style={styles.botaoPadraoB} onPress={servicoEditando ? editarServico : cadastrarServico}>
                                        <MaterialIcons name="save" size={32} color="#fefaf1" />
                                    </TouchableOpacity>
                                    {servicoEditando && (
                                        <TouchableOpacity style={styles.botaoPadraoB} onPress={confirmarExclusaoServ}>
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
                        <Text style={styles.tituloPadrao}>PRÓXIMOS SERVIÇOS</Text>
                        <View style={{ flexDirection: 'column' }}>
                            {servicosVigentes.map((servico, index) => (
                                <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }} onPress={() => toggleForm(servico)}>
                                    <Text style={styles.subTituloPadrao}>{`${servico.Cliente.nomeCliente} - ${new Date(servico.dataInicio).toLocaleDateString('pt-BR')}`}</Text>
                                    <MaterialIcons name="edit" size={24} color="black" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <View style={styles.contentListaClientes}>
                        <Text style={styles.tituloPadrao}>SERVIÇOS ANTERIORES</Text>
                        <View style={{ flexDirection: 'column' }}>
                            {servicosConcluidos.map((servico, index) => (
                                <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }} onPress={() => toggleForm(servico)}>
                                    <Text style={styles.subTituloPadrao}>{`${servico.Cliente.nomeCliente} - ${new Date(servico.dataInicio).toLocaleDateString('pt-BR')}`}</Text>
                                    <MaterialIcons name="edit" size={24} color="black" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Servicos;
