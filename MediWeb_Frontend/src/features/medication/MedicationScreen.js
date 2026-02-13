import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform, useWindowDimensions, StatusBar, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomDropdown from "components/CustomDropdown";
import RenderHtml from "react-native-render-html";
import { useLocalSearchParams, Link, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { addToFavorites, addMedicationToProfile, getMedicationsForProfile, removeFromFavorites } from "features/profile/profile.api";
import { submitReview, updateReview } from "features/review/review.api";
import ReviewSection from "features/review/ReviewSection";
import { useMedicationService } from "./MedicationService";
import { createStyles } from "./MedicationScreen.style";
import { toast } from "utils/toast";
import Navbar from "components/Navbar";
import { useTheme } from "contexts/ThemeContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MedicationDetailsScreen() {
  const { id: itemId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    data,
    reviews,
    averageRating,
    ratingDistribution,
    currentUser,
    isFavorite,
    favoriteId,
    profiles,
    loading,
    setIsFavorite,
    fetchReviews,
    setFavoriteId,
  } = useMedicationService(itemId);

  const [submitting, setSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    baseInfo: false,
    substitutes: false,
    packages: false,
    sideEffects: false,
    application: false,
    fullLeaflet: false,
    finalSamples: false,
    defectiveForms: false,
  });

  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [profileHasMedication, setProfileHasMedication] = useState(false);

  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdateReview = async (payload) => {
    setSubmitting(true);
    try {
      await updateReview(itemId, payload);
      await fetchReviews();
    } catch (e) {
      console.error("Hiba a vélemény módosításakor:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const { width: contentWidth } = useWindowDimensions();

  const renderHtmlSection = (html) =>
    html ? (
      <RenderHtml
        contentWidth={contentWidth - 64}
        source={{ html }}
        baseStyle={{ color: theme.colors.textSecondary }}
        tagsStyles={{
          p: { marginVertical: 4 },
          ul: { marginLeft: 16 },
          li: { marginVertical: 2 },
          a: { color: theme.colors.primary },
        }}
      />
    ) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Nem található adat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const docs = [
    { icon: "file-alt", label: "Betegtájékoztató", url: data.patientInfoUrl },
    { icon: "file-medical", label: "Alkalmazási előírás", url: data.smpcUrl },
    { icon: "file-signature", label: "Címkeszöveg", url: data.labelUrl },
  ].filter((d) => d.url);

  const handleCheckProfileMedication = async (profileId) => {
    try {
      const result = await getMedicationsForProfile(profileId, itemId);
      setProfileHasMedication(result?.some(m => m.itemId === parseInt(itemId)) ?? false);
    } catch (e) {
      console.error("Nem sikerült lekérni a profil gyógyszereit:", e);
      setProfileHasMedication(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <Navbar />
      <View style={styles.backButtonRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.backButtonText}>Vissza</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.contentWrapper}>
          {/* Cím */}
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.subtitle}>
            Hatóanyag: {data.substance} {data.atcCode ? `• ATC: ${data.atcCode}` : ""}
          </Text>

          {/* Inaktív banner */}
          {data.active === false && (
            <View style={styles.inactiveBanner}>
              <FontAwesome5 name="exclamation-triangle" size={16} color={theme.colors.error} style={styles.inactiveBannerIcon} />
              <Text style={styles.inactiveBannerText}>
                Ez a készítmény inaktívnak jelölődött.
              </Text>
            </View>
          )}

          {/* Kedvencek gomb */}
          <TouchableOpacity
            style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
            onPress={async () => {
              try {
                if (isFavorite && favoriteId) {
                  await removeFromFavorites(favoriteId);
                  setIsFavorite(false);
                  setFavoriteId(null);
                  toast.success("Eltávolítva a kedvencek közül.");
                } else {
                  const res = await addToFavorites(itemId);
                  setIsFavorite(true);
                  setFavoriteId(res.id);
                  toast.success("Hozzáadva a kedvencekhez.");
                }
              } catch (e) {
                toast.error("Nem sikerült módosítani a kedvencek listát.");
                console.error(e);
              }
            }}
          >
            <FontAwesome5 name="heart" size={18} solid={isFavorite} color={isFavorite ? theme.colors.favorite : theme.colors.textTertiary} />
            <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
              {isFavorite ? "Kedvencben van" : "Kedvencekhez adás"}
            </Text>
          </TouchableOpacity>

          {/* Profilhoz adás */}
          <View style={styles.profileRow}>
            <View style={styles.profilePickerWrapper}>
              <CustomDropdown
                options={profiles.map((p) => ({ label: p.name, value: p.id }))}
                selectedValue={selectedProfileId}
                onValueChange={async (value) => {
                  const id = value ? Number(value) : null;
                  setSelectedProfileId(id);
                  if (id) {
                    await handleCheckProfileMedication(id);
                  } else {
                    setProfileHasMedication(false);
                  }
                }}
                placeholder="Válassz profilt..."
                disabled={profiles.length === 0}
              />
            </View>
            <TouchableOpacity
              style={[styles.addButton, (!selectedProfileId || profileHasMedication) && { opacity: 0.4 }]}
              disabled={!selectedProfileId || profileHasMedication}
              onPress={async () => {
                try {
                  await addMedicationToProfile(selectedProfileId, itemId);
                  toast.success("Hozzáadva a profilhoz!");
                  setProfileHasMedication(true);
                  setSelectedProfileId(null);
                } catch (err) {
                  if (err.response?.status === 409) {
                    toast.warn("Ez a gyógyszer már hozzá van adva ehhez a profilhoz.");
                    setProfileHasMedication(true);
                  } else {
                    toast.error("Hiba történt a profilhoz adáskor.");
                  }
                }
              }}
            >
              <FontAwesome5 name="plus" size={14} color={theme.colors.white} />
              <Text style={styles.addButtonText}>Hozzáadás</Text>
            </TouchableOpacity>
          </View>

          {/* Kép */}
          {data.imageUrl && (
            <View style={styles.imageSection}>
              <Image source={{ uri: data.imageUrl }} resizeMode="contain" style={styles.mainImage} />
            </View>
          )}

          {/* Dokumentum ikonok */}
          {docs.length > 0 && (
            <View style={styles.iconRow}>
              {docs.map((doc, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.iconButton}
                  onPress={() => Linking.openURL(doc.url)}
                >
                  <View style={styles.iconCircle}>
                    <FontAwesome5 name={doc.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.iconLabel}>{doc.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Allergia info */}
          <View style={styles.allergySection}>
            <Text style={styles.sectionTitle}>Allergia információk</Text>
            <View style={styles.allergyRow}>
              <AllergyBadge label="Laktóz" contains={data.containsLactose} />
              <AllergyBadge label="Búzakeményítő" contains={data.containsGluten} />
              <AllergyBadge label="Benzoát" contains={data.containsBenzoate} />
            </View>
          </View>

          {/* Részletes információk */}
          <View style={styles.gridSection}>
            <Text style={styles.sectionTitle}>Részletes információk</Text>
            <View style={styles.gridRow}>
              <InfoItem label="Kábítószer" value={data.narcotic?.toLowerCase() === "igen"} />
              <InfoItem label="Vényköteles" value={data.hazipatikaInfo?.prescriptionRequired} />
              <InfoItem label="Patikán kívül" value={data.hazipatikaInfo?.outsidePharmacy} />
              <InfoItem label="TB támogatás" value={data.hazipatikaInfo?.normativeTbSupport} />
              <InfoItem label="Közgyógyellátás" value={data.hazipatikaInfo?.publicHealthSupport} />
              <InfoItem label="EÜ támogatás" value={data.hazipatikaInfo?.euSupportable} />
              <InfoItem label="EÜ kiemelt" value={data.hazipatikaInfo?.euPrioritySupport} />
              <InfoItem label="Üzemi baleset" value={data.hazipatikaInfo?.accidentCoverage} />
            </View>
          </View>

          {/* Accordion szekciók – csak ha van tartalom */}
          <Accordion title="Alapadatok" isOpen={openSections.baseInfo} onToggle={() => toggleSection("baseInfo")}>
            <Detail label="Hatóanyag" value={data.substance} />
            <Detail label="ATC kód" value={data.atcCode} />
            <Detail label="Engedély jogosultja" value={data.company} />
            <Detail label="Jogalap" value={data.legalBasis} />
            <Detail label="Státusz" value={data.status} />
            <Detail label="Engedélyezés" value={data.authorizationDate} />
            <Detail label="Nyilv. szám" value={data.registrationNumber} />
          </Accordion>

          {data.substitutes?.length > 0 && (
            <Accordion title="Helyettesítő készítmények" isOpen={openSections.substitutes} onToggle={() => toggleSection("substitutes")}>
              {data.substitutes.map((s, i) => (
                <Link key={i} href={`/medication/${s.itemId}`} style={styles.substituteLink}>
                  <Text style={styles.substituteLinkText}>{s.name} ({s.registrationNumber})</Text>
                </Link>
              ))}
            </Accordion>
          )}

          {data.packages?.length > 0 && (
            <Accordion title="Kiszerelések" isOpen={openSections.packages} onToggle={() => toggleSection("packages")}>
              {data.packages.map((p, i) => (
                <View key={i} style={styles.packageItem}>
                  <Text style={styles.packageText}>{p.name} ({p.registrationNumber})</Text>
                </View>
              ))}
            </Accordion>
          )}

          {data.hazipatikaInfo?.sections?.find(s => s.heading.includes("Lehetséges mellékhatások"))?.html && (
            <Accordion title="Lehetséges mellékhatások" isOpen={openSections.sideEffects} onToggle={() => toggleSection("sideEffects")}>
              {renderHtmlSection(data.hazipatikaInfo.sections.find(s => s.heading.includes("Lehetséges mellékhatások")).html)}
            </Accordion>
          )}

          {data.hazipatikaInfo?.sections?.find(s => s.heading.includes("Hogyan kell alkalmazni"))?.html && (
            <Accordion title="Hogyan kell alkalmazni?" isOpen={openSections.application} onToggle={() => toggleSection("application")}>
              {renderHtmlSection(data.hazipatikaInfo.sections.find(s => s.heading.includes("Hogyan kell alkalmazni")).html)}
            </Accordion>
          )}

          {data.hazipatikaInfo?.sections?.length > 0 && (
            <Accordion title="Teljes betegtájékoztató" isOpen={openSections.fullLeaflet} onToggle={() => toggleSection("fullLeaflet")}>
              {data.hazipatikaInfo.sections.map((section, i) => (
                <View key={i}>
                  <Text style={styles.leafletHeading}>{section.heading}</Text>
                  {renderHtmlSection(section.html)}
                </View>
              ))}
            </Accordion>
          )}

          {data.finalSamples?.length > 0 && (
            <Accordion title="Véglegminták" isOpen={openSections.finalSamples} onToggle={() => toggleSection("finalSamples")}>
              {data.finalSamples.map((f, i) => (
                <View key={i} style={styles.packageItem}>
                  <Text style={styles.packageText}>{f.packageDescription} – {f.decisionDate}</Text>
                </View>
              ))}
            </Accordion>
          )}

          {data.defectiveForms?.length > 0 && (
            <Accordion title="Alaki hibák" isOpen={openSections.defectiveForms} onToggle={() => toggleSection("defectiveForms")}>
              {data.defectiveForms.map((d, i) => (
                <View key={i} style={styles.packageItem}>
                  <Text style={styles.packageText}>{d.packageDescription} – {d.decisionDate}</Text>
                </View>
              ))}
            </Accordion>
          )}

          <ReviewSection
            reviews={reviews}
            averageRating={averageRating}
            ratingDistribution={ratingDistribution}
            submitting={submitting}
            isLoggedIn={!!currentUser}
            userId={currentUser?.id}
            onSubmit={async ({ rating, positive, negative }) => {
              if (!rating || !currentUser?.id) return;
              setSubmitting(true);
              try {
                await submitReview(itemId, { rating, positive, negative, userId: currentUser.id });
                await fetchReviews();
              } catch (e) {
                console.error("Hiba az értékelés beküldésekor:", e);
              } finally {
                setSubmitting(false);
              }
            }}
            updateReview={handleUpdateReview}
            theme={theme}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===== Helper Components ===== */

function AllergyBadge({ label, contains }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={[styles.allergyBadge, contains ? styles.allergyBadgeYes : styles.allergyBadgeNo]}>
      <FontAwesome5
        name={contains ? "exclamation-circle" : "check-circle"}
        size={14}
        color={contains ? theme.colors.error : theme.colors.success}
      />
      <Text style={[styles.allergyBadgeText, contains ? styles.allergyBadgeTextYes : styles.allergyBadgeTextNo]}>
        {label}
      </Text>
    </View>
  );
}

function InfoItem({ label, value }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.gridItem}>
      <FontAwesome5
        name={value ? "check-circle" : "times-circle"}
        size={14}
        color={value ? theme.colors.success : theme.colors.textTertiary}
        solid
      />
      <Text style={[styles.gridItemText, value && styles.gridItemTextActive]}>{label}</Text>
    </View>
  );
}

function Detail({ label, value }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "—"}</Text>
    </View>
  );
}

function Accordion({ title, isOpen, onToggle, children }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.accordionWrapper}>
      <TouchableOpacity onPress={onToggle} style={styles.accordionHeader} activeOpacity={0.7}>
        <Text style={styles.accordionTitle}>{title}</Text>
        <FontAwesome5 name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={theme.colors.textTertiary} />
      </TouchableOpacity>
      {isOpen && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
}
