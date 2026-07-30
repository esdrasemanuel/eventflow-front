import React, { useState, useEffect, useMemo } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Image,
    Alert,
    ScrollView,
} from 'react-native';
import { getBeveragesCatalog, addTrackedItem } from '../services/drinkTrackingService';
import { COLORS } from '../constants/theme';

export default function AddItemModal({ visible, onClose, eventId, userId, onItemAdded, drinkImages }) {
    const [beverages, setBeverages] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBeverage, setSelectedBeverage] = useState(null);
    // quantity using (+ / -)
    const [quantity, setQuantity] = useState(1);

    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            loadCatalog();
        } else {
            resetForm();
        }
    }, [visible]);

    const loadCatalog = async () => {
        try {
            setLoadingCatalog(true);
            const data = await getBeveragesCatalog();
            setBeverages(data);
        } catch (error) {
            console.error('Error loading catalog:', error);
            Alert.alert('Error', 'The drinks list could not be loaded.');
        } finally {
            setLoadingCatalog(false);
        }
    };

    const resetForm = () => {
        setSelectedBeverage(null);
        setSelectedCategory('All');
        setQuantity(1);
    };

    const categories = useMemo(() => {
        const uniqueCategories = new Set(
            beverages
                .map((b) => b.category)
                .filter((cat) => Boolean(cat))
        );
        return ['All', ...Array.from(uniqueCategories)];
    }, [beverages]);

    const filteredBeverages = useMemo(() => {
        if (selectedCategory === 'All') return beverages;
        return beverages.filter((item) => item.category === selectedCategory);
    }, [beverages, selectedCategory]);

    const handleSelectBeverage = (beverage) => {
        setSelectedBeverage(beverage);
    };

    // function to use the Stepper for quantity (+ and -)
    const incrementQuantity = () => setQuantity((prev) => prev + 1);
    const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // unit price fixed 
    const unitPrice = useMemo(() => {
        if (!selectedBeverage) return 0;
        return Number(selectedBeverage.unitPrice || selectedBeverage.price || 0);
    }, [selectedBeverage]);

    // calc the dinamic total price
    const calculatedTotal = useMemo(() => {
        return (quantity * unitPrice).toFixed(2);
    }, [quantity, unitPrice]);

    const handleSave = async () => {
        if (!selectedBeverage) {
            Alert.alert('Attention', 'Select a drink.');
            return;
        }

        if (quantity <= 0) {
            Alert.alert('Attention', 'The quantity must be at least 1.');
            return;
        }

        try {
            setSubmitting(true);
            await addTrackedItem({
                eventId: eventId,
                beverageId: selectedBeverage.id,
                quantity: quantity,
                unitPrice: unitPrice,
                addedBy: userId
            });

            Alert.alert('Sucess', 'Item registered successfully!');
            onItemAdded();
            onClose();
        } catch (error) {
            console.log(error)
            Alert.alert('Error', 'It was not possible to save the consumption of the beverage.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* hearder */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add drinks</Text>
                        <TouchableOpacity onPress={onClose} disabled={submitting}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* gategory filter */}
                    <Text style={styles.label}>Categories:</Text>
                    <View style={styles.categoryContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                                        onPress={() => setSelectedCategory(cat)}
                                    >
                                        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* drink list */}
                    <Text style={styles.label}>Select the item:</Text>
                    {loadingCatalog ? (
                        <ActivityIndicator size="small" color="#2E6D67" style={{ marginVertical: 20 }} />
                    ) : (
                        <View style={styles.catalogList}>
                            <FlatList
                                data={filteredBeverages}
                                keyExtractor={(item) => String(item.id)}
                                style={{ maxHeight: 160 }}
                                ListEmptyComponent={
                                    <Text style={styles.emptyCatalogText}>No drinks found in this category.</Text>
                                }
                                renderItem={({ item }) => {
                                    const isSelected = selectedBeverage?.id === item.id;
                                    const itemPrice = Number(item.unitPrice || item.price || 0).toFixed(2);

                                    return (
                                        <TouchableOpacity
                                            style={[styles.beverageOption, isSelected && styles.beverageOptionSelected]}
                                            onPress={() => handleSelectBeverage(item)}
                                        >
                                            {item.imageUrl && (
                                                <Image source={drinkImages[item.imageUrl]} style={styles.beverageImage} />
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.beverageName, isSelected && styles.textSelected]}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.beverageCategory}>{item.category || 'Geral'}</Text>
                                            </View>

                                            <Text style={[styles.catalogUnitPrice, isSelected && styles.textSelected]}>
                                                € {itemPrice}
                                            </Text>

                                            {isSelected && <Text style={styles.checkmark}> ✓</Text>}
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    )}

                    {/* unit price  */}
                    <View style={styles.detailsRow}>
                        <View style={styles.stepperSection}>
                            <Text style={styles.infoLabel}>Unit price</Text>
                            <View style={styles.infoBox}>
                                <Text style={styles.infoValue}>€ {unitPrice.toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Stepper */}
                        <View style={styles.stepperSection}>
                            <Text style={styles.infoLabel}>Quantity</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity style={styles.stepperBtn} onPress={decrementQuantity}>
                                    <Text style={styles.stepperBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.stepperValue}>{quantity}</Text>
                                <TouchableOpacity style={styles.stepperBtn} onPress={incrementQuantity}>
                                    <Text style={styles.stepperBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* dinamic total*/}
                    <View style={styles.totalPreviewBox}>
                        <Text style={styles.totalPreviewLabel}>Total Items:</Text>
                        <Text style={styles.totalPreviewValue}>€ {calculatedTotal}</Text>
                    </View>

                    {/* action buttons */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={submitting}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
                            {submitting ? (
                                <ActivityIndicator color="#FFF" size="small" />
                            ) : (
                                <Text style={styles.saveBtnText}>Add</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E1B4B',
    },
    closeButton: {
        fontSize: 20,
        color: '#6B7280',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryChipActive: {
        backgroundColor: '#2E6D67',
        borderColor: '#2E6D67',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4B5563',
    },
    categoryTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    catalogList: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 16,
    },
    beverageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    beverageOptionSelected: {
        backgroundColor: '#E6F4F1',
    },
    beverageImage: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
        marginRight: 10,
    },
    beverageName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    beverageCategory: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    catalogUnitPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4B5563',
        marginRight: 4,
    },
    textSelected: {
        color: '#2E6D67',
        fontWeight: 'bold',
    },
    checkmark: {
        fontSize: 16,
        color: '#2E6D67',
        fontWeight: 'bold',
    },
    emptyCatalogText: {
        textAlign: 'center',
        color: '#9CA3AF',
        padding: 16,
        fontSize: 13,
    },
    /* Stepper */
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 10,
        width: 150,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    stepperSection: {
        alignItems: 'flex-start',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 5,
    },
    stepperBtn: {
        width: 56,
        height: 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    stepperBtnText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2E6D67',
    },
    stepperValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        paddingHorizontal: 25,
    },
    /* total box */
    totalPreviewBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
    },
    totalPreviewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    totalPreviewValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E6D67',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    cancelBtnText: {
        color: '#4B5563',
        fontWeight: '600',
    },
    saveBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#2E6D67',
        alignItems: 'center',
        minWidth: 100,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});