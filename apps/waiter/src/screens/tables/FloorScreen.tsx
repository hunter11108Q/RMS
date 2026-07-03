import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types';
import TableCard from '../../components/TableCard';
import EmptyState from '../../components/ui/EmptyState';
import { tableApi } from '../../api/table.api';

type NavProp = StackNavigationProp<AppStackParamList>;

export const FloorScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();
  const { selectedBranch } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const fetchLayout = async () => {
    if (!selectedBranch) return;
    try {
      // 1. Fetch branch detail to get floors
      const branchRes = await tableApi.getBranchDetails(selectedBranch.id);
      if (branchRes.success && branchRes.data?.floors) {
        const floorsList = branchRes.data.floors;
        setFloors(floorsList);
        if (floorsList.length > 0 && !selectedFloorId) {
          setSelectedFloorId(floorsList[0].id);
        }
      }

      // 2. Fetch tables list
      const tablesRes = await tableApi.listTables(selectedBranch.id);
      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
      }
    } catch (err) {
      console.warn('Error fetching floor layout:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchLayout();
    }
  }, [selectedBranch, isFocused]);

  const filteredTables = tables.filter(
    (t) => !selectedFloorId || t.floorId === selectedFloorId
  );

  return (
    <View style={styles.container}>
      {/* Floor selector tabs */}
      {floors.length > 0 ? (
        <View style={styles.floorTabs}>
          {floors.map((floor) => (
            <TouchableOpacity
              key={floor.id}
              onPress={() => setSelectedFloorId(floor.id)}
              style={[
                styles.floorTab,
                selectedFloorId === floor.id ? styles.activeFloorTab : null,
              ]}
            >
              <Text style={[
                styles.floorTabText,
                selectedFloorId === floor.id ? styles.activeFloorTabText : null,
              ]}>
                {floor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredTables.length === 0 ? (
        <EmptyState title="No Tables Registered" description="Verify your branch floor plan settings in the management console." />
      ) : (
        <FlatList
          data={filteredTables}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TableCard
              table={item}
              onPress={() => navigation.navigate('TableDetail', { tableId: item.id, tableName: item.name })}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  floorTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: layout.radius.sm,
    marginRight: 8,
  },
  activeFloorTab: {
    backgroundColor: colors.primary,
  },
  floorTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.muted,
  },
  activeFloorTabText: {
    color: colors.card,
  },
  listContent: {
    padding: 8,
  },
});

export default FloorScreen;
