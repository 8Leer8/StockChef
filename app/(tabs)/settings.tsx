import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, Platform, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { BentoCard } from '@/components/ui/BentoCard';
import { Colors, Layout, StatusColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { 
  useProfileQuery, 
  useUpdateProfileMutation, 
  useCategoriesQuery, 
  useAddCategoryMutation, 
  useDeleteCategoryMutation 
} from '@/hooks/useInventory';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];
  const { mode, setMode } = useTheme();

  const isDarkMode = mode === 'dark';

  // Profile State
  const { data: profile, isLoading: profileLoading } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // Categories State
  const { data: ingCategories = [], isLoading: ingCatLoading } = useCategoriesQuery('ingredient');
  const { data: recCategories = [], isLoading: recCatLoading } = useCategoriesQuery('recipe');
  const addCategory = useAddCategoryMutation();
  const deleteCategory = useDeleteCategoryMutation();

  const [newIngCat, setNewIngCat] = useState('');
  const [newRecCat, setNewRecCat] = useState('');

  const handleUpdateName = () => {
    if (!profile || !newName.trim()) return;
    updateProfile.mutate({ id: profile.id, display_name: newName }, {
      onSuccess: () => {
        setEditingName(false);
        setNewName('');
      }
    });
  };

  const handleAddCategory = (type: 'ingredient' | 'recipe') => {
    const name = type === 'ingredient' ? newIngCat : newRecCat;
    if (!name.trim()) return;

    addCategory.mutate({ name, type }, {
      onSuccess: () => {
        if (type === 'ingredient') setNewIngCat('');
        else setNewRecCat('');
      }
    });
  };

  const handleDeleteCategory = (id: string, name: string, type: 'ingredient' | 'recipe') => {
    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteCategory.mutate({ id, type }) }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: c.text }]}>Settings</Text>

        {/* ── Profile ─────────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>Profile</Text>
        <BentoCard>
          <View style={styles.profileRow}>
            <View style={[styles.avatarBox, { backgroundColor: c.primary + '15' }]}>
              <MaterialIcons name="person" size={28} color={c.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              {editingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    style={[styles.nameInput, { color: c.text, borderBottomColor: c.primary }]}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder={profile?.display_name || 'Your Name'}
                    placeholderTextColor={c.textTertiary}
                    autoFocus
                  />
                  <TouchableOpacity onPress={handleUpdateName} disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? (
                      <ActivityIndicator size="small" color={c.primary} />
                    ) : (
                      <MaterialIcons name="check" size={24} color={c.primary} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingName(false)}>
                    <MaterialIcons name="close" size={24} color={c.danger} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.nameDisplayRow}>
                  <View>
                    <Text style={[styles.profileName, { color: c.text }]}>{profile?.display_name || 'Chef'}</Text>
                    <Text style={[styles.profileRole, { color: c.textTertiary }]}>Branch Manager</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setEditingName(true); setNewName(profile?.display_name || ''); }}>
                    <MaterialIcons name="edit" size={18} color={c.textTertiary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </BentoCard>

        {/* ── Appearance ──────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: c.textSecondary, marginTop: 24 }]}>Appearance</Text>
        <BentoCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: c.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: c.textTertiary }]}>Toggle dark theme manually</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => setMode(val ? 'dark' : 'light')}
              trackColor={{ false: c.border, true: c.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFF' : (isDarkMode ? c.primary : '#f4f3f4')}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: c.borderLight }]} />

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setMode('system')}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: c.text }]}>Follow System</Text>
              <Text style={[styles.settingDesc, { color: c.textTertiary }]}>
                {mode === 'system' ? 'Currently following system settings' : 'Set to follow system settings'}
              </Text>
            </View>
            {mode === 'system' && (
              <MaterialIcons name="check" size={24} color={c.primary} />
            )}
          </TouchableOpacity>
        </BentoCard>

        {/* ── Categories ──────────────────────────── */}
        <Text style={[styles.sectionTitle, { color: c.textSecondary, marginTop: 24 }]}>Ingredient Categories</Text>
        <BentoCard>
          <View style={styles.addCategoryRow}>
            <TextInput
              style={[styles.catInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
              placeholder="Add new category..."
              placeholderTextColor={c.textTertiary}
              value={newIngCat}
              onChangeText={setNewIngCat}
            />
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: c.primary }]}
              onPress={() => handleAddCategory('ingredient')}
              disabled={addCategory.isPending}
            >
              <MaterialIcons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.catList}>
            {ingCatLoading ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              ingCategories.map((cat: any) => (
                <View key={cat.id} style={[styles.catItem, { borderBottomColor: c.borderLight }]}>
                  <Text style={[styles.catName, { color: c.text }]}>{cat.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteCategory(cat.id, cat.name, 'ingredient')}>
                    <MaterialIcons name="delete-outline" size={18} color={c.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </BentoCard>

        <Text style={[styles.sectionTitle, { color: c.textSecondary, marginTop: 24 }]}>Recipe Categories</Text>
        <BentoCard>
          <View style={styles.addCategoryRow}>
            <TextInput
              style={[styles.catInput, { backgroundColor: c.background, color: c.text, borderColor: c.border }]}
              placeholder="Add new category..."
              placeholderTextColor={c.textTertiary}
              value={newRecCat}
              onChangeText={setNewRecCat}
            />
            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: c.primary }]}
              onPress={() => handleAddCategory('recipe')}
              disabled={addCategory.isPending}
            >
              <MaterialIcons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.catList}>
            {recCatLoading ? (
              <ActivityIndicator size="small" color={c.primary} />
            ) : (
              recCategories.map((cat: any) => (
                <View key={cat.id} style={[styles.catItem, { borderBottomColor: c.borderLight }]}>
                  <Text style={[styles.catName, { color: c.text }]}>{cat.name}</Text>
                  <TouchableOpacity onPress={() => handleDeleteCategory(cat.id, cat.name, 'recipe')}>
                    <MaterialIcons name="delete-outline" size={18} color={c.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </BentoCard>

        <Text style={[styles.sectionTitle, { color: c.textSecondary, marginTop: 24 }]}>About</Text>
        <BentoCard>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: c.text }]}>Version</Text>
            <Text style={[styles.settingDesc, { color: c.textTertiary }]}>1.0.0</Text>
          </View>
        </BentoCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: 140,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Layout.spacing.xxl,
    marginTop: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  // Profile styles
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: 4,
  },
  // Category styles
  addCategoryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  catInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catList: {
    gap: 2,
  },
  catItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '500',
  },
});
