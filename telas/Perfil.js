import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from '../style/estilo';

const Perfil = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { idUsuario } = route.params || {};

    const [usuario, setUsuario] = useState(null);
    const [editandoNome, setEditandoNome] = useState(false);
    const [editandoCpf, setEditandoCpf] = useState(false);
    const [editandoEmail, setEditandoEmail] = useState(false);
    const [editandoSenha, setEditandoSenha] = useState(false);
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [message, setMessage] = useState('');
    const [messagemErro, setMessagemErro] = useState('');
    const [estaEditando, setEstaEditando] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:3000/usuarios/${idUsuario}`);
                setUsuario(response.data);
            } catch (error) {
                console.error('Erro ao buscar Usuário:', error);
            }
        };
        
        if (idUsuario) {
            fetchData();
        } else {
            console.error('ID do usuário não fornecido');
        }
    }, [idUsuario]);

    const atualizarUsuario = async () => {
        try {
            if (editandoSenha && usuario.senha !== confirmarSenha) {
                setMessagemErro('As senhas não coincidem.');
                setTimeout(() => {
                    setMessagemErro('');
                }, 3000);
                return;
            }
    
            await axios.put(`http://10.0.2.2:3000/usuarios/${idUsuario}`, usuario);
            setMessage('Dados atualizados com sucesso!');
            setTimeout(() => {
                setMessage('');
            }, 3000);
    
            setEditandoNome(false);
            setEditandoCpf(false);
            setEditandoEmail(false);
            setEditandoSenha(false);
            setConfirmarSenha('');
            setEstaEditando(false);
        } catch (error) {
            console.error('Erro ao atualizar Usuário:', error);
        }
    };

    const cancelarEdicao = () => {
        setEditandoNome(false);
        setEditandoCpf(false);
        setEditandoEmail(false);
        setEditandoSenha(false);
        setConfirmarSenha('');
        setEstaEditando(false);
    };
    
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ backgroundColor: '#252525' }}>
                <View style={styles.containerTelaPadrao}>
                    <View style={styles.contentListaClientes}>
                        <Text style={styles.tituloPadrao}>MEU PERFIL</Text>
                        {usuario ? (
                            <>
                                <View style={styles.row}>
                                    <TextInput 
                                        style={styles.inputDadosPerfil} 
                                        editable={editandoNome} 
                                        value={usuario.nomeUsuario} 
                                        onChangeText={(text) => {
                                            setUsuario({ ...usuario, nomeUsuario: text });
                                            setEstaEditando(true);
                                        }} 
                                    />
                                    {!editandoNome && (
                                        <TouchableOpacity style={styles.editIcon} onPress={() => {
                                            setEditandoNome(true);
                                            setEstaEditando(true);
                                        }}>
                                            <MaterialIcons name="edit" size={24} color="black" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <TextInput 
                                        style={styles.inputDadosPerfil} 
                                        editable={editandoCpf} 
                                        value={usuario.cpf} 
                                        onChangeText={(text) => {
                                            setUsuario({ ...usuario, cpf: text });
                                            setEstaEditando(true);
                                        }} 
                                    />
                                    {!editandoCpf && (
                                        <TouchableOpacity style={styles.editIcon} onPress={() => {
                                            setEditandoCpf(true);
                                            setEstaEditando(true);
                                        }}>
                                            <MaterialIcons name="edit" size={24} color="black" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <TextInput 
                                        style={styles.inputDadosPerfil} 
                                        editable={editandoEmail} 
                                        value={usuario.emailUsuario} 
                                        onChangeText={(text) => {
                                            setUsuario({ ...usuario, emailUsuario: text });
                                            setEstaEditando(true);
                                        }} 
                                    />
                                    {!editandoEmail && (
                                        <TouchableOpacity style={styles.editIcon} onPress={() => {
                                            setEditandoEmail(true);
                                            setEstaEditando(true);
                                        }}>
                                            <MaterialIcons name="edit" size={24} color="black" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <TextInput 
                                        style={styles.inputDadosPerfil}
                                        editable={editandoSenha}   
                                        value={editandoSenha ? usuario.senha : '********'}
                                        placeholder={editandoSenha ? 'Nova Senha' : ''}
                                        secureTextEntry={true}  
                                        onChangeText={(text) => {
                                            setUsuario({ ...usuario, senha: text });
                                            setEstaEditando(true);
                                        }} 
                                    />
                                    {!editandoSenha && (
                                        <TouchableOpacity style={styles.editIcon} onPress={() => {
                                            setEditandoSenha(true);
                                            setUsuario({ ...usuario, senha: '' });
                                            setEstaEditando(true);
                                        }}>
                                            <MaterialIcons name="edit" size={24} color="black" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {editandoSenha && (
                                    <TextInput 
                                        style={styles.inputDadosPerfil} 
                                        placeholder="Confirmar senha" 
                                        value={confirmarSenha} 
                                        onChangeText={text => {
                                            setConfirmarSenha(text);
                                            setEstaEditando(true);
                                        }} 
                                        secureTextEntry={true}  
                                    />
                                )}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.botaoPadraoB, 
                                            { backgroundColor: estaEditando ? '#252525' : '#ccc' }
                                        ]} 
                                        onPress={atualizarUsuario}
                                        disabled={!estaEditando}
                                    >
                                        <MaterialIcons name="save" size={32} color="#fefaf1" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.botaoPadraoB} onPress={cancelarEdicao}>
                                        <MaterialIcons name="close" size={32} color="#fefaf1" />
                                    </TouchableOpacity>
                                </View>
                                {message ? (
                                    <Text style={styles.successMessage}>{message}</Text>
                                ) : (
                                    messagemErro ? (
                                        <Text style={styles.errorMessage}>{messagemErro}</Text>
                                    ) : null
                                )}
                            </>
                        ) : (
                            <Text style={styles.tituloPadrao}>Erro ao carregar dados do usuário.</Text>
                        )}
                    </View>                    
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Perfil;
