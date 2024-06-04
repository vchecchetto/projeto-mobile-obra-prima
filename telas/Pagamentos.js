import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, TextInput, TouchableOpacity, Text, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles } from '../style/estilo';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const Pagamentos = () => {
    const navigation = useNavigation();

    const [situacaoPag, setSituacaoPag] = useState('Pago');
    const [tipoPag, setTipoPag] = useState('Pix');
    const [dataPagamento, setDataPagamento] = useState(new Date());
    const [valorPagamento, setValorPagamento] = useState('');
    const [detalhesPagamento, setDetalhesPagamento] = useState('À Vista');

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [servicosLista, setServicosLista] = useState([]);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState('Não Pagos');
    const [servicoSelecionado, setServicoSelecionado] = useState(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [pagamentoEditando, setPagamentoEditando] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');

    const heightAnimation = new Animated.Value(0);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/cadastro-servico');
            setServicosLista(response.data);
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleForm = (servico = null) => {
        setIsFormVisible(!isFormVisible);
        setServicoSelecionado(servico);
        if (servico) {
            const pagamento = servico.Pagamento;
            if (pagamento) {
                setPagamentoEditando(pagamento);
                setSituacaoPag(pagamento.situacaoPag || 'Pago');
                setTipoPag(pagamento.tipoPag || 'Pix');
                setDataPagamento(new Date(pagamento.dataPagamento) || new Date());
                setValorPagamento(pagamento.valorPagamento ? pagamento.valorPagamento.toString() : '');
                setDetalhesPagamento(pagamento.detalhesPagamento || 'À Vista');
            } else {
                resetForm();
                setPagamentoEditando(null);
            }
        } else {
            resetForm();
            setPagamentoEditando(null);
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

    const resetForm = () => {
        setSituacaoPag('Pago');
        setTipoPag('Pix');
        setDataPagamento(new Date());
        setValorPagamento('');
        setDetalhesPagamento('À Vista');
    };

    const filtrarServicos = (categoria) => {
        switch (categoria) {
            case 'Pagos':
                return servicosLista.filter(servico => servico.Pagamentos.some(pagamento => pagamento.situacaoPag === 'Pago'));
            case 'A Pagar':
                return servicosLista.filter(servico => servico.Pagamentos.some(pagamento => pagamento.situacaoPag === 'A Pagar'));
            case 'Atrasados':
                return servicosLista.filter(servico => servico.Pagamentos.some(pagamento => pagamento.situacaoPag === 'Atrasado'));
            case 'Não Pagos':
                return servicosLista.filter(servico => servico.Pagamentos.every(pagamento => !pagamento.situacaoPag));
            default:
                return servicosLista;
        }
    };
    
    const servicosFiltrados = filtrarServicos(categoriaSelecionada);

    const salvarPagamento = async () => {
        if (!situacaoPag || !tipoPag || !valorPagamento || !detalhesPagamento) {
            setErrorMessage('Por favor, preencha todos os campos.');
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
            return;
        }

        const novoPagamento = {
            situacaoPag,
            tipoPag,
            dataPagamento,
            valorPagamento,
            detalhesPagamento,
            idServico: servicoSelecionado.idServico
        };

        try {
            if (pagamentoEditando) {
                await axios.put(`http://10.0.2.2:3000/atualizar-pagamento/${pagamentoEditando.idPagamento}`, novoPagamento);
            } else {
                await axios.post('http://10.0.2.2:3000/cadastro-pagamento', novoPagamento);
            }
            toggleForm();
            fetchData();
        } catch (error) {
            console.error('Erro ao salvar pagamento:', error);
        }
    };

    const excluirPagamento = async () => {
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja excluir este pagamento?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            await axios.delete(`http://10.0.2.2:3000/excluir-pagamento/${pagamentoEditando.idPagamento}`);
                            toggleForm();
                            fetchData();
                        } catch (error) {
                            console.error('Erro ao excluir pagamento:', error);
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    useEffect(() => {
        if (servicoSelecionado && servicoSelecionado.Pagamento) {
            const pagamento = servicoSelecionado.Pagamento;
            setPagamentoEditando(pagamento);
            setSituacaoPag(pagamento.situacaoPag || 'Pago');
            setTipoPag(pagamento.tipoPag || 'Pix');
            setDataPagamento(new Date(pagamento.dataPagamento) || new Date());
            setValorPagamento(pagamento.valorPagamento ? pagamento.valorPagamento.toString() : '');
            setDetalhesPagamento(pagamento.detalhesPagamento || 'À Vista');
        } else {
            resetForm();
            setPagamentoEditando(null);
        }
    }, [servicoSelecionado]);
    

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: '#252525'}}>
                <View style={styles.containerTelaPadrao}>
                    <View style={styles.contentListaPagamentos}>
                        <Text style={styles.tituloPadrao}>PAGAMENTOS</Text>
                        <View style={{ alignItems: 'center'}}>
                            <Picker
                                selectedValue={categoriaSelecionada}
                                style={{ height: 50, width: 200 }}
                                onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
                            >
                                <Picker.Item label="Não Pagos" value="Não Pagos" />
                                <Picker.Item label="Pagos" value="Pagos" />
                                <Picker.Item label="A Pagar" value="A Pagar" />
                                <Picker.Item label="Atrasados" value="Atrasados" />                                
                            </Picker>
                        </View>
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginRight: 65,
                            }}>
                                <Text style={styles.subTituloPadraoD}>OS</Text>
                                <Text style={styles.subTituloPadraoD}>Cliente</Text>
                                <Text style={styles.subTituloPadraoD}>Data</Text>
                            </View>
                            {servicosFiltrados.map((servico, index) => (
                                <TouchableOpacity key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }} onPress={() => toggleForm(servico)}>
                                    <Text style={styles.subTituloPadraoC}>{servico.idServico}</Text>
                                    <Text style={styles.subTituloPadraoC}>{`${servico.Cliente.nomeCliente}`}</Text> 
                                    <Text style={styles.subTituloPadraoC}>{`${new Date(servico.dataInicio).toLocaleDateString('pt-BR')}`}</Text>                                   
                                    <MaterialIcons name="edit" size={22} color="black" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    {isFormVisible && (
                        <View style={styles.containerTelaPadrao}>
                            <View style={styles.contentFormulario}>
                                <Text style={styles.tituloPadrao}>CADASTRAR PAGAMENTO</Text>
                                <View style={styles.contentPickerC}>
                                    <Picker
                                        selectedValue={situacaoPag}
                                        onValueChange={(itemValue) => setSituacaoPag(itemValue)}
                                    >
                                        <Picker.Item label="Pago" value="Pago" />
                                        <Picker.Item label="A Pagar" value="A Pagar" />
                                        <Picker.Item label="Atrasado" value="Atrasado" />
                                    </Picker>
                                </View>
                                <View style={styles.contentPickerC}>
                                    <Picker
                                        selectedValue={tipoPag}
                                        onValueChange={(itemValue) => setTipoPag(itemValue)}
                                    >
                                        <Picker.Item label="Pix" value="Pix" />
                                        <Picker.Item label="Dinheiro" value="Dinheiro" />
                                        <Picker.Item label="Cartão de Crédito" value="Cartão de Crédito" />
                                        <Picker.Item label="Cartão de Débito" value="Cartão de Débito" />
                                    </Picker>
                                </View>
                                <View style={styles.contentPickerC}>
                                    <Picker
                                        selectedValue={detalhesPagamento}
                                        onValueChange={(itemValue) => setDetalhesPagamento(itemValue)}
                                    >
                                        <Picker.Item label="À Vista" value="À Vista" />
                                        <Picker.Item label="Parcelado" value="Parcelado" />
                                    </Picker>
                                </View>                        
                                <TouchableOpacity style={styles.dataInputB} onPress={() => setDatePickerVisible(true)}>
                                    <Text style={styles.subTituloPadraoB}>{dataPagamento.toLocaleDateString('pt-BR')}</Text>
                                </TouchableOpacity>
                                {isDatePickerVisible && (
                                    <DateTimePicker
                                    value={dataPagamento}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setDatePickerVisible(false);
                                        if (selectedDate) setDataPagamento(selectedDate);
                                    }}
                                    />                                 
                                )}
                                <TextInput
                                    style={styles.inputB}
                                    placeholder="Valor Pago"
                                    value={valorPagamento}
                                    keyboardType="numeric"
                                    onChangeText={setValorPagamento}
                                />
                                {errorMessage ? (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                                    </View>
                                ) : null}   
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity
                                        style={styles.botaoPadraoB}
                                        onPress={salvarPagamento}
                                    >
                                        <MaterialIcons name="save" size={32} color="#fefaf1" />
                                    </TouchableOpacity>
                                    {pagamentoEditando && (
                                        <TouchableOpacity style={styles.botaoPadraoB} onPress={excluirPagamento}>
                                            <MaterialIcons name="delete" size={32} color="#fefaf1" />
                                        </TouchableOpacity>                                
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Pagamentos;
