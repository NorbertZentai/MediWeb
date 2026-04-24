import React, { useState, useMemo } from 'react';
import {
    View, Text, TouchableOpacity, TextInput, Modal, StyleSheet,
    Platform, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'contexts/ThemeContext';

const REPORT_REASONS = [
    { key: 'SPAM', label: 'Spam vagy hirdetés', icon: 'bullhorn' },
    { key: 'INAPPROPRIATE', label: 'Nem megfelelő tartalom', icon: 'ban' },
    { key: 'MISLEADING', label: 'Félrevezető információ', icon: 'exclamation-triangle' },
    { key: 'OFFENSIVE', label: 'Sértő / bántó nyelvezet', icon: 'hand-paper' },
    { key: 'OTHER', label: 'Egyéb', icon: 'ellipsis-h' },
];

export default function ReportModal({ visible, onClose, onSubmit, reviewAuthor }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [selectedReason, setSelectedReason] = useState(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;
        try {
            setSubmitting(true);
            await onSubmit(selectedReason, comment.trim() || null);
            setSelectedReason(null);
            setComment('');
            onClose();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Nem sikerült elküldeni a bejelentést.';
            Alert.alert('Hiba', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setComment('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                        <View style={styles.modal}>
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.headerIcon}>
                                    <FontAwesome5 name="flag" size={18} color={theme.colors.error} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.title}>Értékelés bejelentése</Text>
                                    {reviewAuthor && (
                                        <Text style={styles.subtitle}>
                                            {reviewAuthor} értékelése
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                    <FontAwesome5 name="times" size={18} color={theme.colors.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                                {/* Reason Selection */}
                                <Text style={styles.sectionLabel}>Mi a bejelentés oka?</Text>
                                {REPORT_REASONS.map(reason => {
                                    const isSelected = selectedReason === reason.key;
                                    return (
                                        <TouchableOpacity
                                            key={reason.key}
                                            style={[styles.reasonBtn, isSelected && styles.reasonBtnSelected]}
                                            onPress={() => setSelectedReason(reason.key)}
                                            activeOpacity={0.7}
                                        >
                                            <FontAwesome5
                                                name={reason.icon}
                                                size={14}
                                                color={isSelected ? theme.colors.error : theme.colors.textTertiary}
                                                style={{ width: 24 }}
                                            />
                                            <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                                                {reason.label}
                                            </Text>
                                            {isSelected && (
                                                <FontAwesome5 name="check-circle" size={16} color={theme.colors.error} solid />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Comment */}
                                <Text style={styles.sectionLabel}>Megjegyzés (opcionális)</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Írd le bővebben, miért jelented be..."
                                    placeholderTextColor={theme.colors.textTertiary}
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                    numberOfLines={3}
                                    maxLength={500}
                                />
                                <Text style={styles.charCount}>{comment.length}/500</Text>
                            </ScrollView>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                                    <Text style={styles.cancelBtnText}>Mégse</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, (!selectedReason || submitting) && styles.submitBtnDisabled]}
                                    onPress={handleSubmit}
                                    disabled={!selectedReason || submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <FontAwesome5 name="flag" size={13} color="#fff" />
                                            <Text style={styles.submitBtnText}>Bejelentés</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
}

function createStyles(theme) {
    const isWeb = Platform.OS === 'web';
    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.components.modal.overlay,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        keyboardView: {
            width: '100%',
            maxWidth: isWeb ? 480 : undefined,
            alignItems: 'center',
        },
        modal: {
            backgroundColor: theme.components.modal.background,
            borderRadius: theme.components.modal.borderRadius,
            padding: 24,
            width: '100%',
            maxWidth: isWeb ? 480 : undefined,
            ...theme.shadows.lg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            gap: 12,
        },
        headerIcon: {
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: theme.colors.error + '15',
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.textPrimary,
        },
        subtitle: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        closeBtn: {
            padding: 8,
        },
        sectionLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginBottom: 10,
        },
        reasonBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            marginBottom: 8,
            gap: 10,
        },
        reasonBtnSelected: {
            borderColor: theme.colors.error,
            backgroundColor: theme.colors.error + '08',
        },
        reasonText: {
            flex: 1,
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
        },
        reasonTextSelected: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        commentInput: {
            backgroundColor: theme.components.input.background,
            borderRadius: theme.components.input.borderRadius,
            borderWidth: 1,
            borderColor: theme.components.input.border,
            padding: theme.components.input.padding,
            fontSize: theme.components.input.fontSize,
            color: theme.colors.textPrimary,
            minHeight: 80,
            textAlignVertical: 'top',
            ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
        },
        charCount: {
            fontSize: 11,
            color: theme.colors.textTertiary,
            textAlign: 'right',
            marginTop: 4,
            marginBottom: 16,
        },
        actions: {
            flexDirection: 'row',
            gap: 10,
            marginTop: 8,
        },
        cancelBtn: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: theme.components.button.cancelBorder,
            alignItems: 'center',
        },
        cancelBtnText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.components.button.cancelText,
        },
        submitBtn: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: theme.colors.error,
        },
        submitBtnDisabled: {
            opacity: 0.4,
        },
        submitBtnText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#fff',
        },
    });
}
