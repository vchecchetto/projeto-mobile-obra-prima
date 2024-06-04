import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, ScrollView, Platform, View, Image, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { styles } from '../style/estilo';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';

const Home = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [servicoAtual, setServicoAtual] = useState(null);
    const [servicoFuturo, setServicoFuturo] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [ferramentas, setFerramentas] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { idUsuario } = route.params || {};

    const handleNavigateToCalendario = () => {
        navigation.navigate('Agenda');
    };

    const handleNavigateToClientes = () => {
        navigation.navigate('Clientes', { idUsuario });
    };

    const handleNavigateToFerramentas = () => {
        navigation.navigate('Ferramentas', { idUsuario });
    };

    const handleNavigateToServicos = () => {
        navigation.navigate('Obras');
    };

    const handleNavigateToPagamentos = () => {
        navigation.navigate('Pagamentos');
    };

    const handleNavigateToPerfil = () => {
        navigation.navigate('Perfil', { idUsuario });
    };

    useEffect(() => {
        if (route.params && route.params.nomeUsuario) {
            setNomeUsuario(route.params.nomeUsuario);
        }

        axios.get('http://10.0.2.2:3000/servicos-clientes')
            .then(response => {
                setServicoAtual(response.data.servicoAtual || null);
            })
            .catch(error => {
                console.error('Erro ao buscar serviço atual:', error);
            });

        axios.get('http://10.0.2.2:3000/servicos-clientes')
            .then(response => {
                setServicoFuturo(response.data.servicoFuturo || null);
            })
            .catch(error => {
                console.error('Erro ao buscar próximo serviço:', error);
            });
        axios.get('http://10.0.2.2:3000/cadastro-cliente')
            .then(response => {
                setClientes(response.data || []);
            })
            .catch(error => {
                console.error('Erro ao buscar clientes:', error);
            });

        axios.get('http://10.0.2.2:3000/cadastro-ferramenta')
            .then(response => {
                setFerramentas(response.data || []);
            })
            .catch(error => {
                console.error('Erro ao buscar ferramentas:', error);
            });

    }, [route.params]);


    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                try {
                    if (route.params && route.params.nomeUsuario) {
                        setNomeUsuario(route.params.nomeUsuario);
                    }
    
                    const response = await axios.get('http://10.0.2.2:3000/servicos-clientes');
                    setServicoAtual(response.data.servicoAtual || null);
                    setServicoFuturo(response.data.servicoFuturo || null);
                } catch (error) {
                    console.error('Erro ao buscar dados:', error);
                }
            };
    
            loadData();
            return () => {
            };
        }, [route.params])
    );
    
    const pesquisar = () => {
        const clienteEncontrado = clientes.find(cliente =>
            cliente.nomeCliente.toLowerCase() === searchQuery.toLowerCase() ||
            cliente.cpfCnpj === searchQuery
        );
    
        if (clienteEncontrado) {
            Alert.alert(
                'Cliente Encontrado(a)',
                `Nome: ${clienteEncontrado.nomeCliente}\nCPF/CNPJ: ${clienteEncontrado.cpfCnpj}\nEndereço: ${clienteEncontrado.endereco}\nBairro: ${clienteEncontrado.bairro}\nCelular: ${clienteEncontrado.celular}`,
                [{ text: 'OK' }]
            );
            setSearchQuery('');
            return;
        }
    
        const ferramentaEncontrada = ferramentas.find(ferramenta =>
            ferramenta.nomeFerramenta.toLowerCase() === searchQuery.toLowerCase()
        );
    
        if (ferramentaEncontrada) {
            let localizacaoInfo = '';
            if (isNaN(ferramentaEncontrada.localizacao)) {
                localizacaoInfo = `Localização: ${ferramentaEncontrada.localizacao}`;
            } else {
                const nomeCliente = ferramentaEncontrada.Cliente ? ferramentaEncontrada.Cliente.nomeCliente : 'Cliente não encontrado';
                localizacaoInfo = `Localização: ${nomeCliente}`;
            }
            Alert.alert(
                'Ferramenta Encontrada',
                `Nome: ${ferramentaEncontrada.nomeFerramenta}\n${localizacaoInfo}\nOutras Informações: ${ferramentaEncontrada.outrasInfo}`,
                [{ text: 'OK' }]
            );
            setSearchQuery('');
            return;
        }
    
        Alert.alert('Nenhum resultado encontrado', 'Verifique o nome, CPF/CNPJ ou o nome da ferramenta e tente novamente.', [{ text: 'OK' }]);
        setSearchQuery('');
    };
    
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
                <View style={styles.containerHome}>
                    <View style={styles.contentCabecalhoHome}>
                        <Text style={styles.textoCabecalhoHome}>Bem-vindo, {nomeUsuario}</Text>
                        <View style={styles.boxHome}>
                            <Text style={styles.textoBoxHome}>SERVIÇO ATUAL</Text>
                            <View style={styles.subBoxHome}>
                                <View>
                                    <Text style={styles.subTextoBoxHome}>Cliente:</Text>
                                    <Text style={styles.subTextoBoxHome}>Término:</Text>
                                    <Text style={styles.subTextoBoxHome}>Endereço:</Text>
                                </View>
                                <View>
                                    {servicoAtual ? (
                                        <>
                                            <Text style={styles.subTextoBoxHomeLabel}>{servicoAtual.Cliente.nomeCliente}</Text>
                                            <Text style={styles.subTextoBoxHomeLabel}>{format(new Date(servicoAtual.dataFim), 'dd/MM/yy')}</Text>
                                            <Text style={styles.subTextoBoxHomeLabel}>{servicoAtual.Cliente.endereco}</Text>
                                        </>
                                    ) : (
                                        <Text style={styles.subTextoBoxHomeLabel}>Sem serviço.</Text>
                                    )}
                                </View>
                            </View>      
                        </View>
                        <View style={styles.boxHome}>
                            <Text style={styles.textoBoxHome}>PRÓXIMO SERVIÇO</Text>
                            <View style={styles.subBoxHome}>
                                <View>
                                    <Text style={styles.subTextoBoxHome}>Cliente:</Text>
                                    <Text style={styles.subTextoBoxHome}>Início:</Text>
                                    <Text style={styles.subTextoBoxHome}>Endereço:</Text>
                                </View>
                                <View>
                                {servicoFuturo && servicoFuturo.Cliente ? (
                                    <>
                                        <Text style={styles.subTextoBoxHomeLabel}>{servicoFuturo.Cliente.nomeCliente}</Text>
                                        <Text style={styles.subTextoBoxHomeLabel}>{format(new Date(servicoFuturo.dataInicio), 'dd/MM/yy')}</Text>
                                        <Text style={styles.subTextoBoxHomeLabel}>{servicoFuturo.Cliente.endereco}</Text>
                                    </>
                                ) : (
                                    <Text style={styles.subTextoBoxHomeLabel}>Sem serviço.</Text>
                                )}
                                </View>
                            </View>                    
                        </View>
                    </View>
                    <View style={styles.contentSearchBar}>
                        <TextInput
                            style={styles.searchBarHome}
                            placeholder="Digite o cliente ou a ferramenta..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity style={styles.iconContainerHome} onPress={pesquisar}>
                            <MaterialIcons name="search" size={26} color="gray" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.contentBotoesHome}>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToCalendario}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/agenda.png')} style={styles.imageBotoesHome} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Agenda</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToClientes}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/clientes.png')} style={styles.imageBotoesHome} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Clientes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToServicos}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/obras.png')} style={styles.imageBotoesHome} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Obras</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToPagamentos}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/pagamentos.png')} style={{ width: 80, height: 80 }} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Pagamentos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToFerramentas}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/ferramentas.png')} style={styles.imageBotoesHome} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Ferramentas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.botoesHome}
                            onPress={handleNavigateToPerfil}
                        >
                            <View style={styles.imageContainerHome}>
                                <Image source={require('../assets/img/perfil.png')} style={styles.imageBotoesHome} />
                            </View>
                            <Text style={styles.textoBotoesHome}>Perfil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

export default Home;