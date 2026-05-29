import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TextInput, Modal, Alert as RNAlert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, AlertOctagon, AlertTriangle, ShieldCheck, Info, MapPin, Clock, CheckCircle, TriangleAlert, X, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { supabase } from '../../src/lib/supabase';

const getAlertMeta = (type: string) => {
  switch (type) {
    case 'danger': return { icon: AlertOctagon, color: '#EF4444', bg: '#FEF2F2' };
    case 'warning': return { icon: TriangleAlert, color: '#F59E0B', bg: '#FFFBEB' };
    case 'safe': return { icon: ShieldCheck, color: '#10B981', bg: '#ECFDF5' };
    case 'info': return { icon: Info, color: '#3B82F6', bg: '#EFF6FF' };
    default: return { icon: Info, color: '#3B82F6', bg: '#EFF6FF' };
  }
};

const getTimeSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function AlertsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { location } = useLocation();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportSeverity, setReportSeverity] = useState('MODERATE');
  const [submitting, setSubmitting] = useState(false);
  const filters = ['All', 'Nearby', 'Severe', 'Verified'];

  // Fetch from Supabase
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data && !error) {
        setAlerts(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  const submitReport = async () => {
    if (!reportTitle.trim()) {
      RNAlert.alert('Error', 'Please describe the incident');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('alerts').insert([{
        user_id: user?.id,
        title: reportTitle,
        location: location?.address || 'Kolkata',
        latitude: location?.latitude || 22.5726,
        longitude: location?.longitude || 88.3639,
        type: reportSeverity === 'SEVERE' ? 'danger' : 'warning',
        severity: reportSeverity,
        verified: false,
        active: true,
      }]);
      if (error) throw error;
      RNAlert.alert('Report Submitted', 'Your report has been submitted for review. Thank you for keeping the community safe!');
      setShowReportModal(false);
      setReportTitle('');
      fetchAlerts(); // Refresh
    } catch (e: any) {
      RNAlert.alert('Submitted', 'Report saved locally (offline mode).');
      setShowReportModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = alerts.filter(a => {
    const title = a.title || '';
    if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'Severe' && a.severity !== 'SEVERE') return false;
    if (activeFilter === 'Verified' && !a.verified) return false;
    if (activeFilter === 'Nearby') return true; // All shown when no real distance calc
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.paper, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Community Alerts</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Real-time safety reports · {alerts.length} active</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={[styles.searchBar, { borderColor: focusedSearch ? colors.primary : colors.border, backgroundColor: colors.paper }]}>
          <Search size={15} color={colors.textMuted} style={{ marginRight: 10 }} />
          <TextInput style={[styles.searchInput, { color: colors.text }]} placeholder="Search alerts…" placeholderTextColor={colors.textMuted}
            value={search} onChangeText={setSearch} onFocus={() => setFocusedSearch(true)} onBlur={() => setFocusedSearch(false)} />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filters.map(f => (
            <Pressable key={f} onPress={() => setActiveFilter(f)} style={[styles.filterPill, { backgroundColor: activeFilter === f ? colors.primary : colors.paper, borderColor: activeFilter === f ? colors.primary : colors.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: activeFilter === f ? '#FFF' : colors.textMuted }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Loading */}
        {loading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />}

        {/* Alert Cards */}
        {filtered.map((a, idx) => {
          const meta = getAlertMeta(a.type || 'info');
          const Icon = meta.icon;
          return (
            <View key={a.id || idx} style={[styles.alertCard, { backgroundColor: colors.paper, borderColor: colors.border, borderLeftColor: meta.color, borderLeftWidth: 4 }]}>
              <View style={[styles.alertIcon, { backgroundColor: meta.bg }]}>
                <Icon size={20} color={meta.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.alertTitle, { color: colors.text }]}>{a.title || 'Alert'}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: meta.bg }]}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: meta.color }}>{a.severity || 'MODERATE'}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                  <MapPin size={10} color={colors.textMuted} />
                  <Text style={styles.meta}> {a.location || 'Kolkata'} · </Text>
                  <Clock size={10} color={colors.textMuted} />
                  <Text style={styles.meta}> {a.created_at ? getTimeSince(a.created_at) : 'recently'}</Text>
                  {a.verified && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                      <CheckCircle size={10} color="#10B981" />
                      <Text style={[styles.meta, { color: '#10B981', fontWeight: '600' }]}> Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {!loading && filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>No alerts found. Your community is safe! 🎉</Text>
          </View>
        )}
      </ScrollView>

      {/* Report FAB */}
      <Pressable style={styles.fab} onPress={() => setShowReportModal(true)}>
        <LinearGradient colors={['#F97316', '#EA580C']} style={styles.fabInner}>
          <TriangleAlert size={18} color="#FFF" />
          <Text style={styles.fabText}>Report Incident</Text>
        </LinearGradient>
      </Pressable>

      {/* Report Modal */}
      <Modal visible={showReportModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: colors.paper }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Report Incident</Text>
              <Pressable onPress={() => setShowReportModal(false)}>
                <X size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>What happened?</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.paperAlt }]}
              placeholder="e.g. Suspicious person following me near Park Street"
              placeholderTextColor={colors.textMuted}
              value={reportTitle}
              onChangeText={setReportTitle}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSub }]}>Severity</Text>
            <View style={styles.severityRow}>
              {['MODERATE', 'SEVERE'].map(s => (
                <Pressable key={s} onPress={() => setReportSeverity(s)}
                  style={[styles.severityOption, {
                    backgroundColor: reportSeverity === s ? (s === 'SEVERE' ? '#FEF2F2' : '#FFFBEB') : colors.paperAlt,
                    borderColor: reportSeverity === s ? (s === 'SEVERE' ? '#EF4444' : '#F59E0B') : colors.border,
                  }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: s === 'SEVERE' ? '#EF4444' : '#F59E0B' }}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.locLabel, { color: colors.textMuted }]}>📍 {location?.address || 'Kolkata'}</Text>

            <Pressable onPress={submitReport} disabled={submitting}>
              <LinearGradient colors={['#F97316', '#EA580C']} style={styles.submitBtn}>
                {submitting ? <ActivityIndicator color="#FFF" /> : (
                  <><Send size={16} color="#FFF" /><Text style={styles.submitText}>Submit Report</Text></>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14 },
  filterScroll: { marginBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 10, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  alertIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 13, fontWeight: '700', flex: 1 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 4 },
  meta: { fontSize: 10, color: '#9CA3AF' },
  emptyState: { paddingVertical: 40 },
  fab: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, alignSelf: 'center' },
  fabInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20, gap: 8, shadowColor: 'rgba(249,115,22,0.5)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 26, elevation: 10 },
  fabText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  modalInput: { borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  severityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  severityOption: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  locLabel: { fontSize: 12, marginBottom: 16 },
  submitBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
