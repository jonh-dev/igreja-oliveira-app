import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Input } from './Input';
import { Colors, Spacing, Typography } from './design-system';

export const InputTest: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    cep: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChangeText = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    setErrors(newErrors);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Input Component Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de Input</Text>
        
        <Input
          label="Nome"
          value={formData.name}
          onChangeText={(text) => handleChangeText('name', text)}
          placeholder="Digite seu nome"
          required
          error={errors.name}
        />
        
        <Input
          label="Email"
          value={formData.email}
          onChangeText={(text) => handleChangeText('email', text)}
          placeholder="Digite seu email"
          type="email"
          required
          error={errors.email}
        />
        
        <Input
          label="Senha"
          value={formData.password}
          onChangeText={(text) => handleChangeText('password', text)}
          placeholder="Digite sua senha"
          type="password"
          required
          error={errors.password}
        />
        
        <Input
          label="CPF"
          value={formData.cpf}
          onChangeText={(text) => handleChangeText('cpf', text)}
          placeholder="000.000.000-00"
          type="cpf"
          mask="###.###.###-##"
          required
          error={errors.cpf}
        />
        
        <Input
          label="Telefone"
          value={formData.phone}
          onChangeText={(text) => handleChangeText('phone', text)}
          placeholder="(00) 00000-0000"
          type="phone"
          mask="(##) #####-####"
        />
        
        <Input
          label="CEP"
          value={formData.cep}
          onChangeText={(text) => handleChangeText('cep', text)}
          placeholder="00000-000"
          type="cep"
          mask="#####-###"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estados</Text>
        
        <Input
          label="Input com Erro"
          value=""
          onChangeText={() => {}}
          placeholder="Este input tem erro"
          error="Este é um erro de exemplo"
        />
        
        <Input
          label="Input Desabilitado"
          value="Valor fixo"
          onChangeText={() => {}}
          editable={false}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados do Formulário</Text>
        <Text style={styles.dataText}>Nome: {formData.name || 'Não preenchido'}</Text>
        <Text style={styles.dataText}>Email: {formData.email || 'Não preenchido'}</Text>
        <Text style={styles.dataText}>CPF: {formData.cpf || 'Não preenchido'}</Text>
        <Text style={styles.dataText}>Telefone: {formData.phone || 'Não preenchido'}</Text>
        <Text style={styles.dataText}>CEP: {formData.cep || 'Não preenchido'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.darkGray,
    marginBottom: Spacing.md,
  },
  dataText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
}); 