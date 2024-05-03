// graph.service.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { AirportService } from '../airport/airport.service';
import { PriorityQueue } from '../common/priorityQueue.ds';
import { FlightService } from '../flight/flight.service';
import { AirportDistance, Edge } from './graph.interfaces';
import { performance } from 'perf_hooks';

interface EdgeFloyd {
  origin: string;
  destination: string;
  weight: number;
}

@Injectable()
export class GraphService {
  constructor(
    private readonly airportService: AirportService,
    private readonly flightService: FlightService,
    private readonly logger: PinoLogger,
  ) {}

  private static distanceAirports: Map<string, Edge[]> = new Map();
  private static timeAirports: Map<string, Edge[]> = new Map();

  async setup() {
    if (GraphService.distanceAirports.size > 0) {
      return this.getDistances();
    }
    if (GraphService.timeAirports.size > 0) {
      return this.getDistances();
    }

    const airportData = await this.airportService.findAll();
    const flightData = await this.flightService.findUniqueFlights();

    airportData.forEach((airport) => {
      this.addAirport(airport.iata_code);
    });

    flightData.forEach((flight) => {
      this.connectAirports(
        flight.originAirport,
        flight.destinationAirport,
        flight.distance,
      );
    });

    airportData.forEach((airport) => {
      this.addAirportTime(airport.iata_code);
    });

    flightData.forEach((flight) => {
      this.connectAirportsTime(
        flight.originAirport,
        flight.destinationAirport,
        flight.flightDurationMinutes,
      );
    });

    return 'OK';
  }

  getDistances(): Map<string, Edge[]> {
    return GraphService.distanceAirports;
  }

  addAirportTime(name: string): void {
    GraphService.timeAirports.set(name, []);
  }

  connectAirportsTime(
    origin: string,
    destination: string,
    weight: number,
  ): void {
    const edges = GraphService.timeAirports.get(origin) || [];
    edges.push({ destination, weight });
    GraphService.timeAirports.set(origin, edges);
  }

  addAirport(name: string): void {
    GraphService.distanceAirports.set(name, []);
  }

  connectAirports(origin: string, destination: string, weight: number): void {
    const edges = GraphService.distanceAirports.get(origin) || [];
    edges.push({ destination, weight });
    GraphService.distanceAirports.set(origin, edges);
  }

  dijkstraPath(
    start: string,
    end: string,
    type: string,
  ): {
    weights: Map<string, number>;
    path: any[];
    executionTime?: number;
    error: string;
    totalDistance: number;
  } {
    this.logger.info('Dijkstra path');
    const airports =
      type === 'distance'
        ? GraphService.distanceAirports
        : GraphService.timeAirports;

    const startTime = performance.now(); // Start timing

    const weights = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const pq = new PriorityQueue<AirportDistance>(
      (a, b) => a.weight < b.weight,
    );

    airports.forEach((_, airport) => {
      weights.set(airport, airport === start ? 0 : Infinity);
      previous.set(airport, null);
      pq.enqueue({ airport, weight: weights.get(airport)! });
    });

    while (!pq.isEmpty()) {
      const { airport } = pq.dequeue();
      airports.get(airport)?.forEach(({ destination, weight }) => {
        const newDistance = weights.get(airport)! + weight;
        if (newDistance < weights.get(destination)!) {
          weights.set(destination, newDistance);
          previous.set(destination, airport);
          pq.enqueue({ airport: destination, weight: newDistance });
        }
      });
    }
    const endTime = performance.now(); // Start timing

    let current = end;
    const path = [];

    if (previous.get(end) === null) {
      return {
        error: 'No path exists',
        path: [],
        totalDistance: 0,
        weights,
        executionTime: endTime - startTime,
      };
    }

    while (previous.get(current)) {
      const predecessor = previous.get(current);
      path.unshift({
        origin: predecessor,
        destination: current,
        distance: airports
          .get(predecessor)
          ?.find((edge) => edge.destination === current)?.weight,
      });
      current = predecessor;
    }

    return {
      weights,
      path,
      executionTime: endTime - startTime,
      totalDistance: weights.get(end),
      error: '',
    };
  }

  bellmanFordPath(
    start: string,
    end: string,
    type: string,
  ): {
    weights: Map<string, number>;
    path: any[];
    hasNegativeCycle: boolean;
    error?: string;
    executionTime?: number;
  } {
    this.logger.info('Bellman-Ford path');
    const airports =
      type === 'distance'
        ? GraphService.distanceAirports
        : GraphService.timeAirports;

    const startTime = performance.now(); // Start timing

    const weights = new Map<string, number>();
    const predecessors = new Map<string, string>();
    const vertices = Array.from(airports.keys());

    // Initialize weights with Infinity, except the start vertex which should be 0
    vertices.forEach((vertex) => {
      weights.set(vertex, vertex === start ? 0 : Infinity);
      predecessors.set(vertex, null);
    });

    // Relaxation step (vertices - 1 times)
    for (let i = 0; i < vertices.length - 1; i++) {
      let updated = false;
      for (const [u, edges] of airports) {
        if (weights.get(u) !== Infinity) {
          edges.forEach(({ destination, weight }) => {
            if (
              weights.get(u) + weight <
              (weights.get(destination) || Infinity)
            ) {
              weights.set(destination, weights.get(u) + weight);
              predecessors.set(destination, u);
              updated = true;
            }
          });
        }
      }
      if (!updated) break; // If no update, then no need to proceed further
    }

    // Check for negative weight cycles
    for (const [u, edges] of airports) {
      for (const { destination, weight } of edges) {
        if (
          weights.get(u) !== Infinity &&
          weights.get(u) + weight < (weights.get(destination) || Infinity)
        ) {
          return { weights, path: [], hasNegativeCycle: true };
        }
      }
    }

    // Reconstruct the path from end to start using predecessors
    const path = [];
    let current = end;
    while (current !== start) {
      const predecessor = predecessors.get(current);
      if (predecessor === null) break;
      const edge = airports
        .get(predecessor)
        .find((edge) => edge.destination === current);
      path.unshift({
        origin: predecessor,
        destination: current,
        weight: edge.weight,
      });
      current = predecessor;
    }
    const endTime = performance.now(); // End timing

    return {
      weights,
      path,
      hasNegativeCycle: false,
      executionTime: endTime - startTime, // Calculate duration
    };
  }

  floydWarshallWithPath(
    start: string,
    end: string,
    type: string,
  ): {
    path: EdgeFloyd[];
    totalWeight: number;
    executionTime: number;
  } {
    this.logger.info('Floyd-Warshall path computation starts');
    const startTime = performance.now();

    const airports =
      type === 'distance'
        ? GraphService.distanceAirports
        : GraphService.timeAirports;
    const dist: Map<string, Map<string, number>> = new Map();
    const next: Map<string, Map<string, string | null>> = new Map();

    // Initialize the distance and next matrices
    airports.forEach((edges, airport) => {
      dist.set(airport, new Map());
      next.set(airport, new Map());
      airports.forEach((_, innerAirport) => {
        if (airport === innerAirport) {
          dist.get(airport)?.set(innerAirport, 0);
        } else {
          const edge = edges.find((e) => e.destination === innerAirport);
          dist.get(airport)?.set(innerAirport, edge ? edge.weight : Infinity);
          next.get(airport)?.set(innerAirport, edge ? innerAirport : null);
        }
      });
    });

    // Implementing the Floyd-Warshall algorithm
    airports.forEach((_, k) => {
      airports.forEach((_, i) => {
        airports.forEach((_, j) => {
          const i_k = dist.get(i)?.get(k) ?? Infinity;
          const k_j = dist.get(k)?.get(j) ?? Infinity;
          const i_j = dist.get(i)?.get(j) ?? Infinity;
          const newDist = i_k + k_j;
          if (newDist < i_j) {
            dist.get(i)?.set(j, newDist);
            next.get(i)?.set(j, next.get(i)?.get(k));
          }
        });
      });
    });

    // Reconstruct the shortest path from start to end
    const path: EdgeFloyd[] = [];
    let totalWeight = 0;
    let current = start;

    while (current !== end) {
      const nextNode = next.get(current)?.get(end);
      if (nextNode === null) {
        this.logger.info('No path available from ' + start + ' to ' + end);
        break;
      }
      const edge: EdgeFloyd = {
        origin: current,
        destination: nextNode,
        weight: dist.get(current)?.get(nextNode) ?? 0,
      };
      path.push(edge);
      totalWeight += edge.weight;
      current = nextNode;
    }

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Check if the path was successfully reconstructed
    if (current !== end) {
      return { path: [], totalWeight: 0, executionTime };
    }

    return {
      path,
      totalWeight,
      executionTime,
    };
  }

  async findShortestPath(
    start: string,
    end: string,
    type: string,
    // algorithm: string,
  ): Promise<any> {
    const airports =
      type === 'distance'
        ? GraphService.distanceAirports
        : GraphService.timeAirports;

    if (!airports.has(start) || !airports.has(end)) {
      return { error: 'Invalid airport code', path: [], distance: 0 };
    }

    const {
      weights,
      path: dijkstraPath,
      executionTime: dijkstraExecutionTime,
    } = this.dijkstraPath(start, end, type);

    const {
      weights: bellmanFordWeight,
      path: bellmanFordPath,
      hasNegativeCycle,
      executionTime: bellmanFordExecutionTime,
    } = this.bellmanFordPath(start, end, type);

    const {
      path: floydWarshallPath,
      totalWeight: floydWarshallWeight,
      executionTime: floydWarshallExecutionTime,
    } = this.floydWarshallWithPath(start, end, type);

    const dijkstraPathResult = await Promise.all(
      dijkstraPath.map(async (edge) => {
        return {
          ...edge,
          origin: await this.airportService.findByCode(edge.origin),
          destination: await this.airportService.findByCode(edge.destination),
        };
      }),
    );

    const bellmanFordPathResult = await Promise.all(
      bellmanFordPath.map(async (edge) => {
        return {
          ...edge,
          origin: await this.airportService.findByCode(edge.origin),
          destination: await this.airportService.findByCode(edge.destination),
        };
      }),
    );

    const floydWarshallPathResult = await Promise.all(
      floydWarshallPath.map(async (edge) => {
        return {
          ...edge,
          origin: await this.airportService.findByCode(edge.origin),
          destination: await this.airportService.findByCode(edge.destination),
        };
      }),
    );

    return {
      dijkstra: {
        dijkstraExecutionTime,
        dijkstraWeight: weights.get(end), // dijkstraPath
        dijkstraPathResult, // dijkstraPath
      },
      bellmanFord: {
        bellmanFordExecutionTime,
        bellmanFordWeight: bellmanFordWeight.get(end), // bellmanFordPath
        bellmanFordPathResult,
        hasNegativeCycle,
      },
      floydWarshall: {
        floydWarshallExecutionTime,
        floydWarshallWeight,
        floydWarshallPathResult,
      },
    };
  }
}
