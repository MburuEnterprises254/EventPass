import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';

const SEATS_PER_ROW = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface Props {
  bookedSeats: string[];
  selectedSeats: string[];
  onSeatPress: (seatId: string) => void;
  totalSeats: number;
}

type SeatStatus = 'available' | 'booked' | 'selected';

function getSeatStatus(seatId: string, booked: string[], selected: string[]): SeatStatus {
  if (selected.includes(seatId)) return 'selected';
  if (booked.includes(seatId)) return 'booked';
  return 'available';
}

const COLORS: Record<SeatStatus, { bg: string; text: string; border: string }> = {
  available: { bg: '#1A2E1A', text: '#22C55E', border: '#22C55E' },
  booked: { bg: '#2A1A1A', text: '#EF4444', border: '#EF4444' },
  selected: { bg: '#E8B84B', text: '#09090E', border: '#E8B84B' },
};

function buildRows(totalSeats: number): { row: string; cols: number[] }[] {
  const numRows = Math.ceil(totalSeats / SEATS_PER_ROW);
  return Array.from({ length: numRows }, (_, rowIdx) => {
    const rowLabel = String.fromCharCode(65 + rowIdx); // A, B, C…
    const seatsInRow =
      rowIdx < numRows - 1
        ? SEATS_PER_ROW
        : totalSeats - rowIdx * SEATS_PER_ROW;
    return { row: rowLabel, cols: Array.from({ length: seatsInRow }, (_, i) => i + 1) };
  });
}

export default function SeatGrid({ bookedSeats, selectedSeats, onSeatPress, totalSeats }: Props) {
  const rows = buildRows(totalSeats);
  const colsInFirstRow = rows[0]?.cols.length ?? SEATS_PER_ROW;
  // Size seats to fit the widest row
  const SEAT_SIZE = Math.floor((SCREEN_WIDTH - 80) / Math.min(colsInFirstRow, SEATS_PER_ROW));
  const SEAT_GAP = 3;

  function handlePress(seatId: string, status: SeatStatus) {
    if (status === 'booked') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeatPress(seatId);
  }

  return (
    <View style={styles.container}>
      {/* Stage */}
      <View style={styles.stageContainer}>
        <View style={styles.stageLine} />
        <Text style={styles.stageLabel}>STAGE</Text>
        <View style={styles.stageLine} />
      </View>

      {/* Seat Grid */}
      <View style={[styles.grid, { gap: SEAT_GAP + 2 }]}>
        {rows.map(({ row, cols }) => (
          <View key={row} style={styles.rowContainer}>
            <Text style={styles.rowLabel}>{row}</Text>
            <View style={[styles.row, { gap: SEAT_GAP }]}>
              {cols.map((col) => {
                const seatId = `${row}${col}`;
                const status = getSeatStatus(seatId, bookedSeats, selectedSeats);
                const c = COLORS[status];
                return (
                  <TouchableOpacity
                    key={seatId}
                    style={[
                      styles.seat,
                      {
                        width: SEAT_SIZE,
                        height: SEAT_SIZE,
                        backgroundColor: c.bg,
                        borderColor: c.border,
                        opacity: status === 'booked' ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => handlePress(seatId, status)}
                    activeOpacity={status === 'booked' ? 1 : 0.7}
                    disabled={status === 'booked'}
                  >
                    <Text style={[styles.seatText, { color: c.text, fontSize: SEAT_SIZE < 32 ? 8 : SEAT_SIZE < 36 ? 9 : 10 }]}>
                      {col}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {(['available', 'booked', 'selected'] as SeatStatus[]).map((status) => (
          <View key={status} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS[status].border }]} />
            <Text style={styles.legendText}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 20,
  },
  stageLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E8B84B',
    opacity: 0.5,
  },
  stageLabel: {
    color: '#E8B84B',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 3,
  },
  grid: {
    paddingHorizontal: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    color: '#7A7A8A',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    width: 14,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  seat: {
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatText: {
    fontFamily: 'Inter_600SemiBold',
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    color: '#7A7A8A',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
