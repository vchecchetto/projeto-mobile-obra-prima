import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../style/estilo';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

const Calendario = () => {
  const [selected, setSelected] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [serviceDetails, setServiceDetails] = useState(null);
  const navigation = useNavigation();

  const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate);
    const dates = [];

    while (date <= new Date(endDate)) {
      dates.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://10.0.2.2:3000/cadastro-servico');
        const data = await response.json();
        const dates = {};

        data.forEach(service => {
          const dateRange = getDatesInRange(service.dataInicio, service.dataFim);
          dateRange.forEach(date => {
            const color = new Date(date) >= new Date() ? 'blue' : 'red';
            dates[date] = { marked: true, dotColor: color, service };
          });
        });

        setMarkedDates(dates);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
      }
    };

    fetchServices();
  }, []);

  const handleDayPress = day => {
    setSelected(day.dateString);
    const service = markedDates[day.dateString]?.service;
    setServiceDetails(service || null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={{ backgroundColor: '#252525'}}>
        <View style={styles.containerTelaPadrao}>
          <View style={styles.contentListaClientes}>
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                ...markedDates,
                [selected]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
              }}
            />
            {serviceDetails && (
              <View style={styles.containerServicos}>     
                <Text style={styles.tituloPadrao}>SERVIÇO OS Nº {serviceDetails.idServico}</Text>       
                <Text style={styles.agendaTextoB}>Nome: </Text>
                <Text style={styles.agendaTexto}>{serviceDetails.Cliente.nomeCliente}</Text>
                <Text style={styles.agendaTextoB}>Endereço: </Text>
                <Text style={styles.agendaTexto}>{serviceDetails.Cliente.endereco}</Text>
                <Text style={styles.agendaTextoB}>Início: </Text>
                <Text style={styles.agendaTexto}>{formatDate(serviceDetails.dataInicio)}</Text>
                <Text style={styles.agendaTextoB}>Término: </Text>
                <Text style={styles.agendaTexto}>{formatDate(serviceDetails.dataFim)}</Text>
                <Text style={styles.agendaTextoB}>R$: </Text>
                <Text style={styles.agendaTexto}>{serviceDetails.valorTotal}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Calendario;
