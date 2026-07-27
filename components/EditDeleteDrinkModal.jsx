import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';

export default function ItemDetailModal({
    visible,
    item,
    eventId,
    userId,
    onClose,
    onUpdateQuantity,
    onDeleteItem,
}) {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (item) {
            setQuantity(item.qty || 1);
        }
    }, [item]);

    if (!item) return null;

    const handleIncrement = () => setQuantity((prev) => prev + 1);
    const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const handleSave = async () => {
        try {
            setLoading(true);
            await onUpdateQuantity(eventId, item, userId, quantity);
            onClose();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a quantidade.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Item',
            `Are you sure you want to remove ${item.name} from the list?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await onDeleteItem(eventId, item);
                            onClose();
                        } catch (error) {
                            Alert.alert('Erro', 'The item could not be deleted.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const totalPrice = (quantity * (item.unitPrice || 0)).toFixed(2);

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.container}>
                    <View style={styles.header}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.unitPrice}>$ {item.unitPrice?.toFixed(2)} / un</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* qty  */}
                    <Text style={styles.label}>Edit Quantity</Text>
                    <View style={styles.stepperContainer}>
                        <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrement} disabled={loading}>
                            <Text style={styles.stepperText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{quantity}</Text>
                        <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrement} disabled={loading}>
                            <Text style={styles.stepperText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal:</Text>
                        <Text style={styles.subtotalValue}>$ {totalPrice}</Text>
                    </View>

                    {/* actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.saveBtnText}>Salve</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    unitPrice: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    closeIcon: {
        fontSize: 18,
        color: '#9CA3AF',
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textAlign: 'center',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 6,
        alignSelf: 'center',
        marginBottom: 16,
    },
    stepperBtn: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2E6D67',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        paddingHorizontal: 28,
    },
    subtotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    subtotalLabel: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    subtotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E6D67',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteBtn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: 14,
    },
    saveBtn: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#2E6D67',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});