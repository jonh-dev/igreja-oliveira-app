import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Colors, Spacing, Typography } from './design-system';

export const CardTest: React.FC = () => {
  const handleCardPress = () => {
    console.log('Card pressed!');
  };

  const handleButtonPress = () => {
    console.log('Button pressed!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Card Component Test</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Variantes</Text>

        <Card
          title="Card Padrão"
          subtitle="Este é um card padrão com shadow"
          variant="default"
        >
          <Text style={styles.cardText}>
            Este é o conteúdo do card padrão. Ele tem uma sombra suave e é usado
            para conteúdo geral.
          </Text>
        </Card>

        <Card
          title="Card Elevado"
          subtitle="Este é um card com shadow mais pronunciado"
          variant="elevated"
        >
          <Text style={styles.cardText}>
            Este card tem uma sombra mais pronunciada e é usado para destacar
            conteúdo importante.
          </Text>
        </Card>

        <Card
          title="Card Contornado"
          subtitle="Este é um card com borda"
          variant="outlined"
        >
          <Text style={styles.cardText}>
            Este card tem apenas uma borda e é usado para conteúdo secundário ou
            informações complementares.
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards Clicáveis</Text>

        <Card
          title="Card Clicável"
          subtitle="Toque para ver a ação"
          onPress={handleCardPress}
        >
          <Text style={styles.cardText}>
            Este card é clicável e tem feedback visual quando pressionado.
          </Text>
        </Card>

        <Card
          title="Card com Botão"
          subtitle="Card com ação interna"
          variant="elevated"
        >
          <Text style={styles.cardText}>
            Este card contém um botão interno para ações específicas.
          </Text>
          <Button
            title="Ação do Card"
            onPress={handleButtonPress}
            size="small"
            style={styles.cardButton}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards Simples</Text>

        <Card>
          <Text style={styles.cardText}>
            Card sem título, apenas com conteúdo.
          </Text>
        </Card>

        <Card title="Apenas Título">
          <Text style={styles.cardText}>
            Card apenas com título, sem subtítulo.
          </Text>
        </Card>

        <Card subtitle="Apenas Subtítulo">
          <Text style={styles.cardText}>
            Card apenas com subtítulo, sem título.
          </Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards com Ícones</Text>

        <Card
          title="Card com Ícone"
          subtitle="Exemplo de card com ícone"
          icon={<Text style={styles.icon}>📊</Text>}
        >
          <Text style={styles.cardText}>
            Este card tem um ícone no cabeçalho para melhor identificação
            visual.
          </Text>
        </Card>

        <Card
          title="Card de Doação"
          subtitle="R$ 500,00 - Dízimo"
          icon={<Text style={styles.icon}>💰</Text>}
          variant="elevated"
          onPress={handleCardPress}
        >
          <Text style={styles.cardText}>
            Doação registrada em 15/01/2025 por João Silva.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.lightGray,
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
  cardText: {
    fontSize: Typography.fontSizeBase,
    color: Colors.darkGray,
    lineHeight: Typography.fontSizeBase * 1.4,
  },
  cardButton: {
    marginTop: Spacing.md,
  },
  icon: {
    fontSize: Typography.fontSize2xl,
  },
});
