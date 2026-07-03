import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useOwnerStore from '../../store/owner.store';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export const NotificationCenterScreen: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useOwnerStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Alerts & Logs</Text>
        {notifications.some((n) => !n.read) ? (
          <TouchableOpacity onPress={markAllNotificationsRead}>
            <Text style={styles.markText}>Mark all read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <EmptyState title="All Quiet" description="No system triggers or inventory warnings logged." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.read ? styles.unreadCard : null]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {!item.read ? '🔵 ' : ''}{item.title}
                </Text>
                <Text style={styles.time}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text style={styles.body}>{item.body}</Text>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  markText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: layout.spacing.md,
  },
  card: {
    marginBottom: 10,
    padding: 12,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(2,132,199,0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    color: colors.foreground,
  },
  time: {
    fontSize: 10,
    color: colors.muted,
    fontWeight: '600',
  },
  body: {
    fontSize: typography.sizes.xs,
    color: colors.foreground,
    lineHeight: 16,
    fontWeight: '500',
  },
});

export default NotificationCenterScreen;
