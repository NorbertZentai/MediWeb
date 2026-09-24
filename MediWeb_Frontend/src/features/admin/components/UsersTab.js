import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';
import { useResponsiveLayout } from 'hooks/useResponsiveLayout';
import ResponsiveContainer from 'components/ui/ResponsiveContainer';
import { createStyles } from '../AdminScreen.style';
import { getAdminUsers, updateUserRole, toggleUserActive, deleteAdminUser } from '../admin.api';
import { LoadingView, AdminPagination } from './AdminShared';

// ════════════════════════════════════════════════════════
//  USERS TAB
// ════════════════════════════════════════════════════════

export default function UsersTab() {
    const { theme } = useTheme();
    const { isMobile } = useResponsiveLayout();
    const styles = useMemo(() => createStyles(theme, { isMobile }), [theme, isMobile]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers({ search, page, size: 15 });
            setUsers(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (e) {
            console.error('Users load error:', e);
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            loadUsers();
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült módosítani a szerepkört.');
        }
    };

    const handleToggleActive = async (userId, active) => {
        try {
            await toggleUserActive(userId, active);
            loadUsers();
        } catch (e) {
            Alert.alert('Hiba', 'Nem sikerült módosítani az állapotot.');
        }
    };

    const handleDelete = (userId, userName) => {
        const doDelete = async () => {
            try {
                await deleteAdminUser(userId);
                loadUsers();
            } catch (e) {
                Alert.alert('Hiba', 'Nem sikerült törölni a felhasználót.');
            }
        };
        if (Platform.OS === 'web') {
            if (window.confirm(`Biztosan törlöd a(z) "${userName}" felhasználót?`)) doDelete();
        } else {
            Alert.alert('Törlés', `Biztosan törlöd a(z) "${userName}" felhasználót?`, [
                { text: 'Mégse', style: 'cancel' },
                { text: 'Törlés', style: 'destructive', onPress: doDelete },
            ]);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    return (
        <ScrollView style={styles.content}>
            <ResponsiveContainer padded={false} style={styles.contentInner}>
                <Text style={styles.sectionTitle}>Felhasználókezelés</Text>

                {/* Search */}
                <View style={styles.searchRow}>
                    <FontAwesome5 name="search" size={14} color={theme.colors.textTertiary} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Keresés név vagy email alapján..."
                        accessibilityLabel="Felhasználók keresése"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={search}
                        onChangeText={(val) => { setSearch(val); setPage(0); }}
                    />
                </View>

                {loading ? <LoadingView /> : (
                    <>
                        {users.map(user => (
                            <View key={user.id} style={styles.userCard}>
                                <View style={styles.userHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName}>{user.name}</Text>
                                        <Text style={styles.userEmail}>{user.email}</Text>
                                    </View>
                                    <View style={[styles.roleBadge, user.role === 'ADMIN' && styles.roleBadgeAdmin]}>
                                        <Text style={[styles.roleBadgeText, user.role === 'ADMIN' && styles.roleBadgeTextAdmin]}>
                                            {user.role}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.userMeta}>
                                    <View style={styles.metaItem}>
                                        <FontAwesome5 name="calendar-plus" size={11} color={theme.colors.textTertiary} />
                                        <Text style={styles.metaText}>Regisztráció: {formatDate(user.registrationDate)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <FontAwesome5 name="clock" size={11} color={theme.colors.textTertiary} />
                                        <Text style={styles.metaText}>Utolsó belépés: {formatDate(user.lastLogin)}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <FontAwesome5 name="circle" size={8} color={user.isActive ? theme.colors.success : theme.colors.error} solid />
                                        <Text style={styles.metaText}>{user.isActive ? 'Aktív' : 'Inaktív'}</Text>
                                    </View>
                                </View>

                                <View style={styles.userActions}>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${user.role === 'ADMIN' ? 'Admin jog elvétele' : 'Admin jog megadása'}: ${user.name}`}
                                        onPress={() => handleRoleChange(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
                                    >
                                        <FontAwesome5 name="user-shield" size={12} color={theme.colors.info} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.info }]}>
                                            {user.role === 'ADMIN' ? '→ User' : '→ Admin'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel={`${user.isActive ? 'Tiltás' : 'Aktiválás'}: ${user.name}`}
                                        onPress={() => handleToggleActive(user.id, !user.isActive)}
                                    >
                                        <FontAwesome5 name={user.isActive ? 'ban' : 'check'} size={12} color={theme.colors.warning} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.warning }]}>
                                            {user.isActive ? 'Tiltás' : 'Aktiválás'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Törlés: ${user.name}`}
                                        onPress={() => handleDelete(user.id, user.name)}
                                    >
                                        <FontAwesome5 name="trash" size={12} color={theme.colors.error} />
                                        <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>Törlés</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Pagination */}
                        <AdminPagination page={page} totalPages={totalPages} onChange={setPage} />
                    </>
                )}
            </ResponsiveContainer>
        </ScrollView>
    );
}
